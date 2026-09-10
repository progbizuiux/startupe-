/**
 * Progbiz CRM — Third Party Leads API.
 *
 * One POST per registration to the CRM's website enquiry endpoint (see
 * CRM_LEADS_URL - /api/website/save-enquiry, not the /webhook/third-party-leads
 * path the PDF gives, which rejects our key), authenticated with the
 * integration key in `X-API-Key`. The CRM only really models a contact plus free
 * text, so each portal's answers are mapped twice: the ones it has real columns
 * for (name, email, phone, city/state, gender) go in the body, and everything
 * else goes to `additionalData`, which the CRM side maps to its own fields.
 * `description` repeats the same answers as prose so the lead is readable to
 * whoever opens it before any mapping is configured.
 *
 * The CRM processes leads asynchronously, so a 200 means "accepted", not
 * "assigned" — there is nothing to read back.
 *
 * Server only: this module reads the API key from the environment. Never import
 * it into a client component.
 */

const TIMEOUT_MS = 10_000;

/** Read at call time, not module load, so a restart is all it takes to change. */
function config() {
  const url = process.env.CRM_LEADS_URL;
  const apiKey = process.env.CRM_API_KEY;
  const branchId = Number(process.env.CRM_BRANCH_ID);

  if (!url || !apiKey || !Number.isInteger(branchId)) return null;
  return {
    url,
    apiKey,
    branchId,
    /* leadSourceName is an *override*: sent only when asked for, so the CRM's own
       source for this integration stays in charge by default */
    leadSource: process.env.CRM_LEAD_SOURCE || undefined,
    /* Where the CRM emails the new-lead notification. Required - the endpoint
       answers 400 "The value cannot be an empty string. (Parameter 'addresses')"
       without it. */
    notifyEmail: process.env.CRM_NOTIFY_EMAIL || undefined,
  };
}

export const isCrmConfigured = () => config() !== null;

/**
 * The forms accept "98765 43210", "+91 98765 43210" and "09876543210"; the CRM
 * wants one number it can dial. Anything that is not a 10-digit Indian mobile is
 * passed through untouched rather than mangled - the schema already rejected it
 * if it was meant to be one.
 */
function toE164(value) {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return local.length === 10 ? `+91${local}` : value.trim();
}

/** "Label: value" lines, skipping anything blank. */
const lines = (entries) =>
  entries
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

/**
 * Drops blank keys so the CRM is not handed a wall of empty custom fields, and
 * stringifies what is left: `additionalData` is a free-form map the CRM writes
 * into its own text fields, so numbers are sent as text rather than relying on
 * whatever coercion sits on the far side.
 */
const compact = (object) =>
  Object.fromEntries(
    Object.entries(object)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );

/* Sent as `formName`, which the CRM uses to route a lead to a specific
   executive, so these strings are part of the integration - changing one means
   changing the assignment rule on the CRM side too. Plain ASCII: they are
   matched against rules typed into the CRM, where an em dash invites a mismatch. */
const FORM_NAME = {
  aspirant: "Startup E+ - The Aspirant",
  beginner: "Startup E+ - The Beginner",
};

/** Portal 1: the applicant is the contact. */
function fromAspirant(data) {
  return {
    fullName: data.fullName,
    email: data.email,
    phoneNumber: toE164(data.whatsapp),
    whatsappNumber: toE164(data.whatsapp),
    city: data.district,
    state: "Kerala",
    country: "India",
    gender: data.gender,
    description: lines([
      ["Portal", "The Aspirant"],
      ["Age", data.age],
      ["District", data.district],
      ["Current status", data.academicStatus],
      ["Institution", data.institution],
      ["Sector", data.sector],
      ["Primary need", data.primaryNeed],
      ["Pitch", data.pitchSummary],
      ["Pitch video", data.pitchVideoUrl],
    ]),
    additionalData: compact({
      Portal: "The Aspirant",
      Age: data.age,
      Gender: data.gender,
      District: data.district,
      AcademicStatus: data.academicStatus,
      Institution: data.institution,
      Sector: data.sector,
      PrimaryNeed: data.primaryNeed,
      PitchSummary: data.pitchSummary,
      PitchVideoUrl: data.pitchVideoUrl,
      IPAcknowledged: "Yes",
    }),
  };
}

/**
 * Portal 2: the entity applies, so the primary founder becomes the contact and
 * the co-founders are flattened into numbered custom fields - `additionalData`
 * is a flat map on the CRM side, so an array of objects would not survive it.
 */
function fromBeginner(data) {
  const [primary, ...coFounders] = data.founders;

  const coFounderFields = {};
  coFounders.forEach((founder, i) => {
    const n = i + 2; // the primary founder is 1
    coFounderFields[`Founder${n}Name`] = founder.name;
    coFounderFields[`Founder${n}Email`] = founder.email;
    coFounderFields[`Founder${n}Phone`] = toE164(founder.phone);
    coFounderFields[`Founder${n}Background`] = founder.background;
  });

  return {
    fullName: primary.name,
    email: primary.email,
    phoneNumber: toE164(primary.phone),
    whatsappNumber: toE164(primary.phone),
    state: "Kerala",
    country: "India",
    description: lines([
      ["Portal", "The Beginner"],
      ["Entity", data.legalName],
      ["Registration type", data.registrationType],
      ["Udyam number", data.udyamNumber],
      ["Incorporated", data.incorporationDate],
      ["Current stage", data.currentStage],
      ["Funding so far", data.fundingHistory?.join(", ")],
      ["Immediate hurdle", data.operationalHurdle],
      ["Founders", data.founders.map((f) => f.name).join(", ")],
      ["Primary founder background", primary.background],
    ]),
    additionalData: compact({
      Portal: "The Beginner",
      LegalName: data.legalName,
      RegistrationType: data.registrationType,
      UdyamNumber: data.udyamNumber,
      IncorporationDate: data.incorporationDate,
      CurrentStage: data.currentStage,
      FundingHistory: data.fundingHistory?.join(", "),
      OperationalHurdle: data.operationalHurdle,
      FounderCount: String(data.founders.length),
      Founder1Background: primary.background,
      ...coFounderFields,
      IPAcknowledged: "Yes",
    }),
  };
}

const MAPPERS = { aspirant: fromAspirant, beginner: fromBeginner };

/**
 * The request body for a validated submission, or null for an unknown portal.
 *
 * Two escape hatches, both no-ops by default, for a remote side that has been
 * unreliable: CRM_ADDITIONAL_DATA=off drops the custom-field map (its values are
 * all repeated in `description` anyway), and CRM_DROP=state,country removes any
 * named top-level keys. They exist because the API answers 500 with an empty
 * body on leads it dislikes, giving nothing to debug from - being able to strip
 * a field from the payload without a deploy is how you find out which one.
 */
export function buildLead(portal, data) {
  const settings = config();
  const map = MAPPERS[portal];
  if (!settings || !map) return null;

  const { additionalData, ...lead } = map(data);

  const body = {
    ...lead,
    ...(process.env.CRM_ADDITIONAL_DATA !== "off" && { additionalData }),
    branchID: settings.branchId,
    ...(settings.leadSource && { leadSourceName: settings.leadSource }),
    ...(settings.notifyEmail && { ToAddress: settings.notifyEmail }),
    formName: FORM_NAME[portal],
  };

  /* Escape hatch for a CRM that rejects a field: CRM_DROP=state,country removes
     those keys from every lead. Used to find which field the API 500s on. */
  for (const key of (process.env.CRM_DROP ?? "").split(",")) {
    const name = key.trim();
    if (name) delete body[name];
  }

  return body;
}

/**
 * POSTs one validated submission. Resolves `{ ok: false, ... }` rather than
 * throwing, so the caller decides what a failed hand-off means for the visitor.
 */
export async function sendLead(portal, data) {
  const settings = config();
  if (!settings) return { ok: false, error: "CRM is not configured" };

  const body = buildLead(portal, data);
  if (!body) return { ok: false, error: `No CRM mapping for portal "${portal}"` };

  let response;
  try {
    response = await fetch(settings.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": settings.apiKey,
        /* Node's fetch sends `Accept-Language: *` unless told otherwise, and the
           CRM answers 500 with an empty body to any request carrying it - the
           wildcard blows up culture parsing on their side. The identical request
           with a real language tag (or none) validates normally. Do not remove
           this without re-running scripts/crm-smoke-test.mjs. */
        "Accept-Language": "en-US",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    /* network failure or the 10s timeout - the CRM never saw the lead */
    return { ok: false, error: error.name === "TimeoutError" ? "CRM timed out" : String(error) };
  }

  if (!response.ok) {
    /* the API answers 401 / 400 with a body worth having in the log */
    const detail = await response.text().catch(() => "");
    return { ok: false, status: response.status, error: detail.slice(0, 500) };
  }

  return { ok: true, status: response.status };
}
