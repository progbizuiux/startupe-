/**
 * /register page content. One key per section component in
 * src/components/sections/register-*.jsx — nothing here renders JSX, so icons
 * are referenced by key and resolved in the component.
 *
 * This page is the front door. It takes five details, issues a registration ID
 * and a pass, and hands the person on to whichever detailed portal fits them;
 * the portals in src/data/register.js stay the source of truth for what they
 * each offer, so nothing about them is restated here.
 */

/**
 * The two pathways. `value` is what the form submits and what the zod enum in
 * src/lib/register-start-schema.js is built from, `portal` is printed on the
 * pass, and `next` is where the person is sent afterwards. Wording is kept in
 * step with the portal intros in src/data/register.js.
 */
export const REGISTER_STAGES = [
  {
    value: "idea",
    title: "I have an idea",
    text: "A student, recent graduate, or anyone with an idea or a business they have not registered yet.",
    portal: "The Aspirant",
    next: "/register/aspirant",
  },
  {
    value: "running",
    title: "I run a registered business",
    text: "A registered startup or micro-enterprise, roughly 0-2 years old, working through launch and first customers.",
    portal: "The Beginner",
    next: "/register/beginner",
  },
];

export const registerPage = {
  /* ---------- Hero: the promise, and the pass on screen before anything is asked ---------- */
  hero: {
    eyebrow: "Register",
    titleLines: ["Join the movement,"],
    titleHighlight: "get your pass",
    description:
      "Register in about a minute. You get a Startup E+ registration ID and a pass you can download straight away, then a route into the right portal for the detailed application.",
    buttons: [
      { label: "Register now", href: "#form", variant: "primary" },
      { label: "See what you get", href: "#pass", variant: "outline" },
    ],
  },

  /* ---------- The process, stated before the form rather than after it ---------- */
  steps: {
    eyebrow: "How it works",
    heading: "Four steps, and the first three take a minute",
    description:
      "Nothing here is a selection process. Registering puts you on the list and gives you a reference the office can find you by.",
    items: [
      {
        label: "Step 01",
        title: "Fill in five details",
        text: "Your name, email, WhatsApp number, district, and where you are now — an idea, or a business already registered. Nothing else is asked at this stage.",
      },
      {
        label: "Step 02",
        title: "Your ID is issued",
        text: "A registration ID in the form SEP-XXXXX-XXXXX is generated for you and recorded with the Startup E+ office. Quote it whenever you get in touch.",
      },
      {
        label: "Step 03",
        title: "Download your pass",
        text: "A PDF pass carrying your name and ID appears on screen and downloads on a tap. Save it then — it is issued once and cannot be re-generated automatically.",
      },
      {
        label: "Step 04",
        title: "Continue into your portal",
        text: "You are pointed at The Aspirant or The Beginner, where the detailed questions are asked. That step is separate and you can come back to it.",
      },
    ],
  },

  /* ---------- The artefact, and the two honest limits, stated before the form ---------- */
  pass: {
    eyebrow: "What you receive",
    heading: "A registration pass, and the ID on it",
    description:
      "The pass is a single page carrying your name, your registration ID, your district and the pathway you chose. It is a confirmation, not a credential.",
    /* Each becomes a dotted item in the "what is on it" list */
    contains: [
      "Your name, exactly as you typed it",
      "Your registration ID, in the form SEP-XXXXX-XXXXX",
      "Your district and the pathway you chose",
      "The date it was issued",
    ],
    /* Stated before the form on purpose — after the fact these read as excuses */
    limits: [
      {
        title: "Download it when it appears",
        text: "Nothing is stored on this site, so the pass cannot be re-issued automatically. If you lose it, the office can find your registration by your ID or email and send it again.",
      },
      {
        title: "It is a reference, not an entitlement",
        text: "The pass confirms that you registered. It is not proof of enrolment or selection, and it does not by itself reserve a place at any event.",
      },
    ],
  },

  /* ---------- Where the ID is actually used ---------- */
  uses: {
    eyebrow: "What the ID is for",
    heading: "One reference, across the whole programme",
    description:
      "The ID is how the office ties your enquiries, applications and event sign-ups together. Quote it and nobody has to ask you for your details twice.",
    items: [
      "Contacting the office about anything you have already sent",
      "Joining an Entrepreneurship Club at your school or college",
      "Signing up at a Startup Caravan stop",
      "Entering a hackathon or applying for a Conclave place",
    ],
  },

  /* ---------- The form ---------- */
  form: {
    eyebrow: "Register",
    heading: "Your details",
    description: "Five fields. The detailed questions come later, in whichever portal fits you.",
    stageLabel: "Where are you now?",
    stageHint: "This decides which portal you are pointed at afterwards.",
    privacy:
      "Your details are used to register you and to contact you about the programme. They are not published or sold.",
    labels: {
      fullName: "Full name",
      fullNameHint: "In English letters — printed on your pass exactly as you type it",
      email: "Email",
      whatsapp: "WhatsApp number",
      whatsappHint: "10-digit mobile number",
      district: "District",
      submit: "Register and get my pass",
      submitting: "Registering…",
    },
    success: {
      heading: "You're registered",
      body: "Your registration is recorded with the Startup E+ office. Save your pass now — it is issued once and this page cannot generate it again.",
      idLabel: "Your registration ID",
      download: "Download your pass",
      nextLabel: "Your next step",
    },
  },
};
