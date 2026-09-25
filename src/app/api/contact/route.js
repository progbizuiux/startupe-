import { siteConfig } from "@/config/site";
import { isCrmConfigured, sendLead } from "@/lib/crm";
import { contactSchema } from "@/lib/contact-schema";

/**
 * Contact endpoint for the /contact form.
 *
 * Its own route rather than a third portal on /api/register. The register
 * handler's plumbing is portal-agnostic, but everything visitor- and ops-facing
 * in it is registration-specific and load-bearing: it answers "Registrations are
 * not accepted right now", "Could not deliver your registration", and its
 * `[register] undelivered lead` lines are designated as the record to re-enter
 * by hand during a CRM outage. Contact messages filed under that prefix would
 * cost someone real time on the worst possible day. The HTTP layer is split; the
 * CRM layer (lib/crm.js) is shared.
 *
 * Re-validates with the same zod schema the form uses, because client-side
 * validation is a convenience, not a gate - anything can POST here.
 *
 * This form is shorter than either registration, and every accepted submission
 * becomes a real CRM lead AND a notification email to CRM_NOTIFY_EMAIL, so it
 * carries three cheap guards the longer forms do without: a honeypot, an origin
 * check and a per-IP throttle. None of them is a substitute for a captcha if
 * this ever gets targeted properly.
 */

/* Enough for a 1200-character message and the rest of the fields several times
   over; anything larger is not a person filling in a form. */
const MAX_BODY_BYTES = 16 * 1024;

const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

/**
 * Per-IP throttle held in module memory. This is a speed bump, not a guarantee:
 * it is per server instance, so it resets on redeploy and does not coordinate
 * across instances. It exists to stop one script emptying a mailbox, and should
 * be replaced with something shared if abuse ever becomes real.
 */
const hits = new Map();

function throttled(ip, now) {
  const fresh = (hits.get(ip) ?? []).filter((at) => now - at < RATE_LIMIT.windowMs);
  fresh.push(now);
  hits.set(ip, fresh);

  /* the map only ever grows otherwise: drop everyone whose window has passed */
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((at) => now - at >= RATE_LIMIT.windowMs)) hits.delete(key);
    }
  }

  return fresh.length > RATE_LIMIT.max;
}

/** First hop in X-Forwarded-For is the client; fall back to one bucket. */
const clientIp = (request) =>
  (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

/**
 * Rejects a cross-site POST. Only checked when the header is present: a browser
 * sends Origin on any fetch POST, while server-side callers (scripts/crm-smoke-test.mjs)
 * send none and are let through.
 */
function wrongOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin !== new URL(siteConfig.url).origin;
  } catch {
    return true;
  }
}

export async function POST(request) {
  if (wrongOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  /* The Content-Length header is only a cheap pre-filter and must never be the
     actual cap: a chunked POST sends no Content-Length, `Number(null)` is NaN,
     and `NaN > MAX` is false - so the body would sail past this line. The real
     check is on the text below, after it has been read. */
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "Message too large" }, { status: 413 });
  }

  let payload;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return Response.json({ ok: false, error: "Message too large" }, { status: 413 });
    }
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "Malformed request body" }, { status: 400 });
  }

  /* Honeypot, checked before validation and before the throttle. A real visitor
     never sees the field, so anything in it is a bot - answer 201 as though it
     worked, because a 4xx naming the field teaches the next attempt which one to
     leave alone. */
  if (payload?.website) {
    console.warn("[contact] honeypot submission dropped");
    return Response.json({ ok: true }, { status: 201 });
  }

  const now = Date.now();
  const ip = clientIp(request);
  if (throttled(ip, now)) {
    return Response.json(
      { ok: false, error: "Too many messages from here. Please try again later." },
      { status: 429 },
    );
  }

  const parsed = contactSchema.safeParse(payload ?? {});
  if (!parsed.success) {
    /* field -> first message, so the client can map errors back onto inputs */
    const fieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return Response.json({ ok: false, errors: fieldErrors }, { status: 422 });
  }

  /* Never forward the honeypot, even empty. */
  const { website: _honeypot, ...data } = parsed.data;

  /**
   * What goes in the log when a message cannot be delivered.
   *
   * The register route logs the whole submission, because there it is a set of
   * enum answers and the log is the only record. A contact message is up to
   * 1200 characters of free text plus an email and a phone number, and the
   * visitor is told the send failed and to try again - so the body is not lost
   * by leaving it out. Log enough to follow up, not the message itself.
   */
  const forLog = {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone || undefined,
    topic: data.topic,
    preferredReply: data.preferredReply,
    messageLength: data.message.length,
  };

  /* Without the CRM keys there is nowhere for the message to go. In development
     that is normal - log it and let the form flow work. In production it means
     messages would be lost silently, so fail loudly instead. */
  if (!isCrmConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[contact] CRM_LEADS_URL / CRM_API_KEY / CRM_BRANCH_ID are not set");
      return Response.json(
        { ok: false, error: "Messages are not accepted right now" },
        { status: 500 },
      );
    }
    console.warn("[contact] CRM not configured - submission logged only", forLog);
    return Response.json({ ok: true }, { status: 201 });
  }

  /* sendLead resolves rather than throws on every failure, including its own
     10s timeout, so this has to branch on crm.ok - a try/catch alone would
     report a timed-out message as sent. */
  const crm = await sendLead("contact", data);
  if (!crm.ok) {
    console.error("[contact] CRM rejected the message", crm.status ?? "", crm.error);
    console.error("[contact] undelivered message", JSON.stringify(forLog));
    return Response.json(
      {
        ok: false,
        error: "Could not send your message. Please try again.",
        /* what the CRM actually said, for local debugging only - it can carry
           request details that should not be handed to a visitor */
        ...(process.env.NODE_ENV !== "production" && {
          crmStatus: crm.status,
          crmError: crm.error,
        }),
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true }, { status: 201 });
}
