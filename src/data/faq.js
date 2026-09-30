/**
 * FAQ section content. The first item starts open (see `defaultOpen`).
 * `eyebrow` is optional - drop it and the small label above the heading disappears.
 *
 * Every answer below is drawn from copy that already exists elsewhere on the
 * site - the audience cards and the five phases in src/data/about-page.js, the
 * two portal intros in src/data/register.js, and what /register actually does.
 * Nothing here states a fact the site does not state somewhere else: no dates,
 * no fees, no eligibility rule, no promise about places or funding. If an
 * answer needs one of those, it has to come from the office first.
 */
export const faq = {
  eyebrow: "FAQs",
  heading: "Frequently asked questions",
  defaultOpen: 0,

  items: [
    {
      question: "Who is Startup E+ for?",
      answer:
        "Students with an idea, recent graduates building a career on their own terms, women with a product or a skill that deserves to be a business, working entrepreneurs sharpening what they have already started, owners whose business is under pressure and needs an honest assessment, and investors looking for a pipeline of pre-vetted founders. You do not need a registered company or a finished product to begin: no one has to start at the first phase, and the pathway meets people wherever they already are.",
    },
    {
      question: "How does the programme actually work?",
      answer:
        "It runs in five phases. Entrepreneurship Clubs inside schools, colleges, youth clubs and women's collectives build the foundation. The Startup Caravan then takes sessions and on-the-spot registration out to towns and campuses. Structured hackathons turn loose ideas into early business models, while a diagnostic track reviews struggling ventures. The Startup Conclave delivers hands-on training in legal compliance, unit economics and operations, alongside a stabilisation track for businesses correcting course. Finally the Investors' Meet puts refined ventures in front of banks, investors and funding partners.",
    },
    {
      question: "What happens after I register?",
      answer:
        "The form takes about a minute. You get a Startup E+ registration ID and a pass to download straight away, and your registration is recorded with the Startup E+ office. You are then pointed to the portal that fits you, where the detailed application lives. Save the pass when it appears: it is issued once, and the page cannot generate it again.",
    },
    {
      question: "Which portal is mine, The Aspirant or The Beginner?",
      answer:
        "The Aspirant is for students, recent graduates and anyone with an idea or a business they have not registered yet. The Beginner is for registered startups and new micro-enterprises, roughly 0-2 years old, working through launch, product-market fit and first customers. You do not have to decide on your own: the registration form asks whether you are a student, an entrepreneur or a business, and sends you to the right one.",
    },
  ],
};
