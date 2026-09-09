/**
 * Registration portals.
 *
 * Portal 1 - "The Aspirant" (idea stage / wants to start): students, recent
 * graduates and anyone with an idea or an MSME they have not registered yet.
 * The option lists here are the single source of truth: the zod schema in
 * src/lib/register-schema.js builds its enums from them, so adding a sector or
 * a district here is enough - validation follows automatically.
 */

export const KERALA_DISTRICTS = [
  "Alappuzha",
  "Ernakulam",
  "Idukki",
  "Kannur",
  "Kasaragod",
  "Kollam",
  "Kottayam",
  "Kozhikode",
  "Malappuram",
  "Palakkad",
  "Pathanamthitta",
  "Thiruvananthapuram",
  "Thrissur",
  "Wayanad",
];

export const GENDERS = ["Female", "Male", "Other", "Prefer not to say"];

/** Drives whether the "Institution" field is required (see schema). */
export const ACADEMIC_STATUSES = [
  "School student",
  "College student",
  "Recent graduate",
  "Working professional",
  "Not currently studying",
];

export const ENROLLED_STATUSES = ["School student", "College student"];

export const SECTORS = [
  "Agriculture / Food Processing",
  "Deep Tech / Software",
  "Retail / Ecommerce",
  "Healthcare",
  "Creative / Media",
  "Traditional Crafts",
];

export const PRIMARY_NEEDS = [
  "Idea Validation",
  "Co-founder Matching",
  "Prototyping Funds",
  "Basic Guidance",
];

export const PITCH_WORD_LIMIT = 150;

export const aspirant = {
  eyebrow: "Portal 1",
  heading: "The Aspirant",
  intro:
    "For students, recent graduates and anyone with an idea or a business they have not registered yet.",

  support: [
    "Enrollment into your nearest Campus E-Club",
    "Entry to the Zonal Idea Hackathons",
    "Prototyping assistance via NIT Calicut and IIT Madras",
    "Basic entrepreneurship toolkits",
  ],

  /* Shown next to the mandatory acknowledgment checkbox */
  ipTerms:
    "I acknowledge the standard Non-Disclosure and Intellectual Property protection terms, and confirm the idea submitted is my own.",
};

/* ---------------------------------------------------------------------------
   Portal 2 - "The Beginner": registered startups and new micro-enterprises,
   roughly 0-2 years old, working through launch, product-market fit and first
   customers.
   --------------------------------------------------------------------------- */

export const REGISTRATION_TYPES = [
  "Private Limited (Pvt Ltd)",
  "Limited Liability Partnership (LLP)",
  "Partnership",
  "Sole Proprietorship",
];

export const CURRENT_STAGES = ["Ideation / POC", "MVP Ready", "Beta Testing", "Early Revenue"];

/** A company can have been through several of these, so this is multi-select. */
export const FUNDING_HISTORY = ["Bootstrapped", "Friends & Family", "Grants", "External Angel"];

export const OPERATIONAL_HURDLES = [
  "Product Iteration",
  "Customer Acquisition",
  "Regulatory / FSSAI / GST Clearance",
  "Initial Working Capital",
];

export const MAX_FOUNDERS = 5;

export const beginner = {
  eyebrow: "Portal 2",
  heading: "The Beginner",
  intro:
    "For registered startups and new micro-enterprises, roughly 0-2 years old, working through launch, product-market fit and first customers.",

  support: [
    "Foundational mentoring",
    "Compliance and formalization support",
    "Seed capital guidance via KSUM and state schemes",
    "Initial customer access channels",
  ],

  ipTerms:
    "I acknowledge the standard Non-Disclosure and Intellectual Property protection terms, and confirm I am authorised to submit these details on behalf of the entity.",
};

/** Drives the chooser at /register. */
export const portals = [
  {
    slug: "aspirant",
    eyebrow: aspirant.eyebrow,
    heading: aspirant.heading,
    blurb: "I have an idea or want to start, and have not registered an entity yet.",
  },
  {
    slug: "beginner",
    eyebrow: beginner.eyebrow,
    heading: beginner.heading,
    blurb: "I have a registered startup or micro-enterprise, 0-2 years old.",
  },
];
