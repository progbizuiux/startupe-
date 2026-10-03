/**
 * /register page content.
 *
 * The page is deliberately one thing: a short form that issues a registration
 * ID and a downloadable pass, then points the person at the detailed portal
 * that fits them. The portals in src/data/register.js stay the source of truth
 * for what each one offers, so nothing about them is restated here.
 */

/**
 * What the person is, and where that sends them afterwards.
 *
 * This one answer does two jobs: it is recorded on the lead, and it decides
 * which detailed portal the success panel hands them on to. `portal` is printed
 * on the pass; `next` is the link.
 *
 * Worth knowing when reading a lead: an entrepreneur whose business is not
 * registered yet actually belongs in The Aspirant, so the routing is a sensible
 * default rather than a rule. The portals both accept anyone who arrives.
 *
 * Business and Entrepreneur land in the same portal, and deliberately: The
 * Aspirant is for "a business they have not registered yet" and The Beginner
 * for "registered startups and new micro-enterprises" (see src/data/register.js),
 * so anyone answering "Business" has one by definition. The two answers are kept
 * apart anyway because the LEAD reads differently — someone running a trading
 * business is not the same prospect as someone building a startup, and the
 * office sorting the queue can see which is which.
 */
export const OCCUPATIONS = [
  { value: "student", label: "Student", portal: "The Aspirant", next: "/register/aspirant" },
  {
    value: "entrepreneur",
    label: "Entrepreneur",
    portal: "The Beginner",
    next: "/register/beginner",
  },
  { value: "business", label: "Business", portal: "The Beginner", next: "/register/beginner" },
];

export const registerPage = {
  eyebrow: "Register",
  titleLines: ["Join the movement,"],
  titleHighlight: "get your pass",
  description:
    "A short form, about a minute. You get a Startup E+ registration ID and a pass to download, then a route into the right portal for the detailed application.",

  form: {
    /* Plain text, not a checkbox: both registration portals gate on an IP
       acknowledgment because they are taking IP. Registering assigns nothing,
       so the same information runs as a line rather than a mandatory tick. */
    privacy:
      "Your details are used to register you and to contact you about the programme. They are not published or sold. The pass is issued once — download it when it appears, as this page cannot generate it again.",
    legends: {
      you: "About you",
      reach: "How to reach you",
    },
    labels: {
      fullName: "Full name",
      fullNameHint: "In English letters — this is the name printed on your pass",
      age: "Age",
      occupation: "Student, entrepreneur or business",
      email: "Email",
      phone: "Phone number",
      phoneHint: "10-digit mobile number",
      altPhone: "Alternate contact number",
      altPhoneHint: "Someone else we can reach you on",
      address: "Address",
      addressHint: "House or building, street, and town",
      district: "District",
      submit: "Register and get my pass",
      submitting: "Registering…",
    },
    success: {
      heading: "You're registered",
      body: "Recorded with the Startup E+ office. Save your pass now: it is issued once, and this page cannot make another.",
      idLabel: "Your registration ID",
      idHint: "Quote this when you contact the office.",
      pathwayLabel: "Registered as",
      download: "Download your pass",
      nextLabel: "Your next step",
      nextCta: "Continue to the application",
    },
  },
};
