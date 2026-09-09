import { isCrmConfigured, sendLead } from "@/lib/crm";
import { schemaForPortal } from "@/lib/register-schema";

/**
 * Registration endpoint, shared by every portal.
 *
 * The `portal` field on the body selects which schema to validate against, so
 * adding a portal is a schema plus a mapper in lib/crm.js - this handler does
 * not change.
 *
 * Re-validates with the same zod schema the form uses, because client-side
 * validation is a convenience, not a gate - anything can POST here directly.
 *
 * A valid submission is handed to the CRM (Progbiz Third Party Leads API) and
 * that hand-off is the only sink: nothing is stored here, so a CRM failure is
 * reported back as an error and the visitor is asked to try again, rather than
 * being thanked for a registration that went nowhere.
 */
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Malformed request body" }, { status: 400 });
  }

  const { portal, ...data } = payload ?? {};
  const schema = schemaForPortal(portal);
  if (!schema) {
    return Response.json({ ok: false, error: "Unknown portal" }, { status: 400 });
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    /* field -> first message, so the client can map errors back onto inputs */
    const fieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return Response.json({ ok: false, errors: fieldErrors }, { status: 422 });
  }

  /* Without the CRM keys there is nowhere for the lead to go. In development
     that is normal - log it and let the form flow work. In production it means
     registrations would be lost silently, so fail loudly instead. */
  if (!isCrmConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[register] CRM_LEADS_URL / CRM_API_KEY / CRM_BRANCH_ID are not set");
      return Response.json(
        { ok: false, error: "Registrations are not accepted right now" },
        { status: 500 },
      );
    }
    console.warn(`[register] CRM not configured - ${portal} submission logged only`, parsed.data);
    return Response.json({ ok: true }, { status: 201 });
  }

  const crm = await sendLead(portal, parsed.data);
  if (!crm.ok) {
    console.error(`[register] CRM rejected the ${portal} lead`, crm.status ?? "", crm.error);
    /* The CRM is the only sink, so an undelivered registration would otherwise
       be gone. Log the whole thing: while the API is failing, the log is the
       record, and these can be entered by hand or replayed once it is fixed. */
    console.error(`[register] undelivered lead`, JSON.stringify({ portal, ...parsed.data }));
    return Response.json(
      {
        ok: false,
        error: "Could not deliver your registration. Please try again.",
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
