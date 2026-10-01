import { after } from "next/server";
import { siteConfig } from "@/config/site";
import { isCrmConfigured, sendLead } from "@/lib/crm";
import { createRegistrationId } from "@/lib/registration-id";
import { buildRegistrationPass } from "@/lib/register-pass";
import {
  isRegistrationEmailConfigured,
  registrationEmailTransport,
  sendRegistrationEmail,
} from "@/lib/registration-email";
import { registerStartSchema, occupationDetails } from "@/lib/register-start-schema";

/**
 * The /register front door.
 *
 * Unlike the two portals it does not only file a lead — it mints a registration
 * ID and renders a PDF pass, and hands both back in the response. Nothing is
 * stored anywhere, so the ID in the CRM lead is the only copy that outlives the
 * request, and the pass is returned inline because there is nothing to fetch it
 * from later.
 *
 * ORDER OF OPERATIONS matters here and is deliberate:
 *   1. guards      - reject before doing any work
 *   2. validate    - reject a bad name before an ID exists
 *   3. mint the ID
 *   4. render the PDF
 *   5. send to the CRM
 *
 * The PDF is rendered BEFORE the CRM call on purpose: a rendering failure then
 * returns an error with nothing sent, so the visitor can simply try again. The
 * other way round, a throw in the renderer would strand a registration the CRM
 * had already accepted, and the retry would file it twice.
 *
 * It is not free. Rendering measures around 110ms, and because pdf-lib is
 * synchronous that is ~45ms of solid event-loop block — on a single Node
 * process, several registrations landing together will delay whatever else is
 * in flight. Worth knowing before this is put behind one small instance; it is
 * still the right order, because the alternative trades latency for duplicate
 * registrations.
 */

/* Larger than 10s so the CRM's own timeout (see TIMEOUT_MS in lib/crm.js) can
   expire and still leave room to write a response, rather than the platform
   killing the function first and reporting a 504 for a lead that was accepted. */
export const maxDuration = 30;

const MAX_BODY_BYTES = 8 * 1024;
const RATE_LIMIT = { max: 4, windowMs: 10 * 60 * 1000 };

/**
 * Per-IP throttle held in module memory. A speed bump, not a guarantee: it is
 * per server instance, resets on redeploy, and the key comes from a header a
 * client can set unless a proxy rewrites it. It exists so one script cannot
 * empty a mailbox or mint a thousand passes, and it should be replaced with
 * something shared if this is ever targeted properly.
 */
const hits = new Map();

function throttled(key, now) {
  const fresh = (hits.get(key) ?? []).filter((at) => now - at < RATE_LIMIT.windowMs);
  fresh.push(now);
  hits.set(key, fresh);

  if (hits.size > 500) {
    for (const [k, times] of hits) {
      if (times.every((at) => now - at >= RATE_LIMIT.windowMs)) hits.delete(k);
    }
  }
  return fresh.length > RATE_LIMIT.max;
}

/**
 * First hop of X-Forwarded-For, but only if it parses as an address. A bot
 * rotating the header would otherwise land in a fresh bucket every request;
 * rejecting junk sends all of it into one shared bucket instead.
 */
function clientKey(request) {
  const first = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const looksLikeIp = /^[0-9.]+$/.test(first) || /^[0-9a-f:]+$/i.test(first);
  return looksLikeIp && first ? first : "unknown";
}

function wrongOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin !== new URL(siteConfig.url).origin;
  } catch {
    return true;
  }
}

/**
 * A successful registration answers with the pass itself, not with JSON.
 *
 * The artwork is a 1.8MB Photoshop export, so base64ing it into a JSON body
 * would push a ~2.3MB string down the wire — a third of it pure encoding
 * overhead — to someone who is very likely on a phone. Sent as bytes it is the
 * file and nothing more, and the browser can save it straight off.
 *
 * The three things the success panel needs besides the file ride along as
 * headers. They are readable here because the request is same-origin; a
 * cross-origin caller would need Access-Control-Expose-Headers, which is
 * exactly the caller this endpoint refuses anyway.
 *
 * Errors still answer with JSON, so the client branches on content-type.
 */
/**
 * Queue the registrant's confirmation email, to go out once the response has.
 *
 * `after()` and not `await`: the visitor already has the pass in the response,
 * so nothing about their registration is waiting on an email. Awaiting it would
 * add the provider's round trip — and, on a bad day, its 10s timeout — to a
 * request that has already done everything that matters. Fire-and-forget
 * without `after()` would be worse again: on a serverless platform the function
 * can be frozen the moment the response is written, and the send would simply
 * never happen.
 *
 * A failure here is logged and goes no further. The email is a convenience, the
 * registration is already filed, and the pass is already in the browser.
 */
/**
 * Everything the confirmation email needs, gathered in one place so the two
 * call sites cannot pass different things.
 *
 * `pathway: occupation.label` matches what the pass prints under "Registration
 * Pathway"; `portal` is the separate thing the next-step button names.
 */
const mailFor = (data, registrationId, occupation, passBytes) => ({
  to: data.email,
  fullName: data.fullName,
  registrationId,
  pathway: occupation.label,
  portal: occupation.portal,
  nextUrl: occupation.next,
  passBytes,
});

function queueRegistrationEmail(registration) {
  if (!isRegistrationEmailConfigured()) {
    console.warn(
      "[register] no mail transport configured (set RESEND_API_KEY + MAIL_FROM, or MAIL_USER + MAIL_APP_PASSWORD) - nothing sent to",
      registration.to,
    );
    return;
  }

  after(async () => {
    const mail = await sendRegistrationEmail(registration);
    if (mail.ok) {
      console.info(
        `[register] confirmation email sent via ${registrationEmailTransport()}`,
        registration.registrationId,
      );
    } else {
      console.error(
        "[register] confirmation email failed",
        registration.registrationId,
        mail.status ?? "",
        mail.error,
      );
    }
  });
}

const passResponse = (bytes, registrationId, occupation) =>
  new Response(bytes, {
    status: 201,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="startup-e-plus-pass-${registrationId}.pdf"`,
      "Content-Length": String(bytes.length),
      /* nothing about a personal pass belongs in a shared cache */
      "Cache-Control": "no-store",
      "X-Registration-Id": registrationId,
      "X-Registration-Pathway": occupation.portal,
      "X-Registration-Next": occupation.next,
    },
  });

export async function POST(request) {
  if (wrongOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  let payload;
  try {
    /* The Content-Length header is a hint, not a cap: a chunked POST sends none,
       and `Number(null) > MAX` is false. Measure the body we actually read. */
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return Response.json({ ok: false, error: "Request too large" }, { status: 413 });
    }
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "Malformed request body" }, { status: 400 });
  }

  /* Honeypot, before validation and before the throttle. A real visitor never
     sees the field, so anything in it is a bot: answer 201 as though it worked,
     but issue no ID and no pass. A 4xx naming the field would teach the next
     attempt which one to leave alone. */
  if (payload?.website) {
    console.warn("[register] honeypot submission dropped");
    return Response.json({ ok: true, registrationId: null, pass: null }, { status: 201 });
  }

  if (throttled(clientKey(request), Date.now())) {
    return Response.json(
      { ok: false, error: "Too many registrations from here. Please try again later." },
      { status: 429 },
    );
  }

  const parsed = registerStartSchema.safeParse(payload ?? {});
  if (!parsed.success) {
    const fieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return Response.json({ ok: false, errors: fieldErrors }, { status: 422 });
  }

  const { website: _honeypot, ...data } = parsed.data;
  const occupation = occupationDetails(data.occupation);
  const registrationId = createRegistrationId();

  /* Render first — see the note at the top of this file. */
  let passBytes;
  try {
    passBytes = await buildRegistrationPass({
      registrationId,
      fullName: data.fullName,
      /* The pass prints what the person chose — "Student", "Entrepreneur",
         "Business" — not the portal it routes them to. The portal is an
         internal name for a stage of the programme; the answer they gave is the
         one they will recognise on a document a year from now. It still goes on
         the lead and still steers the next step, both as occupation.portal
         below. */
      pathway: occupation.label,
    });
  } catch (error) {
    console.error("[register] could not render the pass", error);
    return Response.json(
      { ok: false, error: "Could not produce your pass. Please try again." },
      { status: 500 },
    );
  }

  /* occupationLabel rather than the raw "student" / "entrepreneur": the value is
     read by a person working the CRM queue, not matched by anything. */
  const lead = {
    ...data,
    registrationId,
    occupationLabel: occupation.label,
    pathway: occupation.portal,
    next: occupation.next,
  };

  /* What is safe to log: enough to follow a registration up by hand, without
     writing the whole record into the server log on every CRM outage. */
  const forLog = {
    registrationId,
    email: data.email,
    district: data.district,
    occupation: data.occupation,
  };

  if (!isCrmConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[register] CRM_LEADS_URL / CRM_API_KEY / CRM_BRANCH_ID are not set");
      return Response.json(
        { ok: false, error: "Registrations are not being accepted right now" },
        { status: 500 },
      );
    }
    console.warn("[register] CRM not configured - registration logged only", forLog);
    /* Queued here too, and deliberately: this branch is development only (the
       production path returned 500 above), and it is the only way to exercise
       the email without live CRM credentials — which is what testing against
       the real CRM costs, a junk lead per attempt. The trade is that a
       developer running with mail configured can send "your registration has
       gone through" for one the CRM never saw. That is entirely within a
       developer's control; junk in the client's CRM is not. */
    queueRegistrationEmail(mailFor(data, registrationId, occupation, passBytes));
    return passResponse(passBytes, registrationId, occupation);
  }

  /* sendLead resolves rather than throws on every failure, including its own
     10s timeout, so this has to branch on crm.ok - a try/catch alone would
     report a timed-out registration as filed. */
  const crm = await sendLead("registerStart", lead);
  if (!crm.ok) {
    console.error("[register] CRM rejected the registration", crm.status ?? "", crm.error);
    console.error("[register] undelivered registration", JSON.stringify(forLog));
    /* No ID and no pass are returned: the registration was not recorded, so
       handing over a pass would be a document for something that did not
       happen. The visitor is told to try again, which mints a fresh ID. */
    return Response.json(
      {
        ok: false,
        error: "Could not complete your registration. Please try again.",
        ...(process.env.NODE_ENV !== "production" && {
          crmStatus: crm.status,
          crmError: crm.error,
        }),
      },
      { status: 502 },
    );
  }

  /* Only past the CRM check: the email says the registration went through, so
     it must not go out for one that did not. */
  queueRegistrationEmail(mailFor(data, registrationId, occupation, passBytes));

  return passResponse(passBytes, registrationId, occupation);
}
