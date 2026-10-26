import { isCrmConfigured, sendLead } from "@/lib/crm";
import { rejectRequest, rejectIfThrottled, readJsonBody } from "@/lib/api-guard";
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

export async function POST(request) {
  const rejected = rejectRequest(request);
  if (rejected) return rejected;

  const { payload, response } = await readJsonBody(request);
  if (response) return response;

  /* Honeypot, checked before validation and before the throttle. A real visitor
     never sees the field, so anything in it is a bot - answer 201 as though it
     worked, because a 4xx naming the field teaches the next attempt which one to
     leave alone. */
  if (payload?.website) {
    console.warn("[contact] honeypot submission dropped");
    return Response.json({ ok: true }, { status: 201 });
  }

  const limited = rejectIfThrottled(request, "Too many messages from here.");
  if (limited) return limited;

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
