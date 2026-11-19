/**
 * Registration portals.
 *
 * Portal 1 - "The Aspirant" (idea stage / wants to start): students, recent
 * graduates and anyone with an idea or an MSME they have not registered yet.
 * The option lists here are the single source of truth: the zod schema in
 * src/lib/register-schema.js builds its enums from them, so adding a sector or
 * a district here is enough - validation follows automatically.
 */

/**
 * The pause switch for BOTH portals.
 *
 * While `paused` is true, /register/aspirant and /register/beginner render the
 * notice below instead of their form. Set it to false to reopen - the forms,
 * their schemas and /api/register are untouched and come straight back.
 *
 * Note that /api/register stays open either way: this closes the two forms on
 * the website, not the endpoint the mobile app posts to.
 */
export const registration = {
  paused: false,

  /* Shown at the top of both portals' form, before anything is filled in -
     not on the confirmation afterwards. Someone deciding whether to start a
     form this long deserves to know the turnaround while they can still act on
     it; told at the end, it is news they can do nothing with.

     One string rather than a copy per portal: the two would quote different
     numbers the moment one of them was edited, and the number is the part
     people hold us to. */
  responseTime:
    "Once you register, expect to hear from us in about 30 days - we are working through registrations in order.",

  notice: {
    heading: "Registration is paused for now",
    body: [
      "We are reading through every idea that has come in so far, so that each one gets a proper look rather than a quick one. We expect that to take about 15 more days.",
      "Registration opens again as soon as the review is finished - do come back then.",
    ],
    submitted:
      "Already registered? Your submission is safely in the queue and is part of this review. There is no need to send it again.",
    /* A closed page with nothing to do on it is the unfriendly part, so it
       keeps one way through to a person. */
    help: { label: "Talk to the team", href: "/contact" },
  },
};

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
  "Education",
  "Creative / Media",
  "Traditional Crafts",
  /* Last, and last for a reason: an "Other" offered earlier in a list gets
     picked by people who would have found their sector two lines further
     down. */
  "Other",
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
