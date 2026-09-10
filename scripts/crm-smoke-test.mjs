/**
 * End-to-end check for the CRM hand-off.
 *
 *   node scripts/crm-smoke-test.mjs [aspirant|beginner] [baseUrl]
 *
 * Posts one clearly-labelled test registration to the site's own /api/register,
 * so it exercises the whole path: zod validation -> lead mapping (src/lib/crm.js)
 * -> Progbiz Third Party Leads API. The dev server has to be running, and it is
 * the server's .env.local that supplies CRM_LEADS_URL / CRM_API_KEY /
 * CRM_BRANCH_ID - this script never reads the key itself.
 *
 * A pass means a real lead is created in whichever CRM those vars point at, so
 * delete it afterwards. In development the response repeats what the CRM said
 * when it refuses, which is the fastest way to see why.
 */
const [portal = "aspirant", baseUrl = "http://localhost:3000"] = process.argv.slice(2);

const NOTE = "TEST LEAD from scripts/crm-smoke-test.mjs - please ignore or delete.";

const submissions = {
  aspirant: {
    portal: "aspirant",
    fullName: "Startup E+ Website Integration Test",
    age: 22,
    gender: "Prefer not to say",
    district: "Kozhikode",
    whatsapp: "9000000001",
    email: "integration-test@startupe.invalid",
    academicStatus: "College student",
    institution: "NIT Calicut",
    pitchSummary: NOTE,
    pitchVideoUrl: "",
    sector: "Deep Tech / Software",
    primaryNeed: "Idea Validation",
    ipAcknowledged: true,
  },
  beginner: {
    portal: "beginner",
    founders: [
      {
        name: "Startup E+ Website Integration Test",
        email: "integration-test@startupe.invalid",
        phone: "9000000001",
        background: NOTE,
      },
    ],
    legalName: "Integration Test Pvt Ltd",
    registrationType: "Private Limited (Pvt Ltd)",
    udyamNumber: "",
    incorporationDate: "2024-06-01",
    currentStage: "MVP Ready",
    fundingHistory: ["Bootstrapped"],
    operationalHurdle: "Initial Working Capital",
    ipAcknowledged: true,
  },
};

const body = submissions[portal];
if (!body) {
  console.error(`Unknown portal "${portal}". Use "aspirant" or "beginner".`);
  process.exit(1);
}

console.log(`POST ${baseUrl}/api/register  (portal: ${portal})`);

const started = Date.now();
let response;
try {
  response = await fetch(`${baseUrl}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
} catch (error) {
  console.error(`Could not reach the site - is \`npm run dev\` running?\n${error}`);
  process.exit(1);
}

const payload = await response.json().catch(() => ({}));
console.log(`${response.status} in ${Date.now() - started}ms`);
console.log(JSON.stringify(payload, null, 2));

if (response.ok) {
  console.log("\nPASS - the CRM accepted the lead. Delete the test lead from the CRM.");
} else if (response.status === 502) {
  console.log("\nFAIL - the site reached the CRM and it refused; see crmStatus / crmError above.");
} else {
  console.log("\nFAIL - the submission did not get as far as the CRM.");
}
process.exit(response.ok ? 0 : 1);
