/**
 * /about page content. One key per section component in
 * src/components/sections/about-*.jsx — nothing here renders JSX, so icons and
 * decorative treatments are referenced by key and resolved in the component.
 *
 * Photos are the launch-event set already used by the home hero
 * (public/images/home-page/).
 */
const home = (name) => `/images/home-page/${name}.webp`;

export const aboutPage = {
  /* ---------- Hero: mirrors the home hero (headline left, intro right, photos under) ---------- */
  hero: {
    eyebrow: "About Us",
    /* Each entry is one line; the highlight is appended to the last line and set
       in the brand gradient, as in src/data/hero.js. */
    titleLines: ["Kerala's greatest resource", "has always"],
    titleHighlight: "been its people",
    description:
      "Startup E+ is an entrepreneurship initiative launched by Shafi Parambil MP, born from a simple conviction: that Kerala's future is best built here, by the people who already call it home.",
    stats: [
      { value: "05", label: "Phases, from idea to investment" },
      { value: "05", label: "Institutional partners" },
      { value: "Vadakara", label: "Where the movement begins" },
    ],
    images: [
      {
        src: home("indrodection"),
        alt: "Shafi Parambil MP arriving at the Startup E+ launch",
        wide: true,
      },
      { src: home("audience-engaged"), alt: "Students listening in the audience at the launch" },
    ],
  },

  /* ---------- The narrative: heading held left, running copy on the right ---------- */
  story: {
    eyebrow: "Our story",
    heading: "A home-grown ecosystem, built where the talent already is",
    body: [
      "For years, talented and capable young minds from this region have moved away in search of careers, taking their ideas, energy and potential with them. Startup E+ exists to change that pattern, by building a home-grown ecosystem where enterprise can be imagined, nurtured and sustained right here in Vadakara.",
      "At its heart, Startup E+ is about shifting how people see themselves and their possibilities. It reimagines entrepreneurship not as a risky exception reserved for a lucky few, but as a natural and achievable path open to students, homemakers, working professionals and small business owners alike.",
      "Whether someone is holding on to a half-formed idea, running a business that has hit a rough patch, or is simply curious about what it takes to build something of their own, Startup E+ is designed to meet them there, with the right guidance, the right people and the right encouragement at the right time.",
      "What makes this initiative different is its long-term, people-rooted approach. Rather than treating entrepreneurship as a one-off event to attend, Startup E+ treats it as an ongoing relationship: mentorship from those who have already walked the path, partnerships with institutions that bring credibility and structure, and a genuine belief that local ideas deserve local investment.",
      "Every conversation, every connection and every opportunity created through Startup E+ is aimed at keeping talent, wealth and ambition rooted within the community rather than letting them drift away.",
    ],
    /* Closing pull quote, set with the gold rule used by the home "message" section */
    quote:
      "Startup E+ is a statement of trust in Kerala's own people: a belief that, given the right support, they can build enterprises that not only sustain themselves but strengthen the region around them. It is less about starting businesses, and more about starting a movement.",
  },

  /* ---------- Dark band: the gap the mission was built to close ---------- */
  mission: {
    eyebrow: "Why it had to be built",
    /* strings render as plain text; { text, highlight } renders a coloured box
       ("pink" | "yellow"), the same shape as src/data/about.js */
    headline: [
      "Kerala has always been a state of extraordinary ",
      { text: "human potential", highlight: "pink" },
      ", yet for decades that potential has quietly ",
      { text: "moved outward", highlight: "yellow" },
    ],
    gaps: [
      {
        title: "Ideas without structure",
        text: "Real ideas go unstructured, with no clear route from a thought to a business model anyone can act on.",
      },
      {
        title: "Ventures that fold early",
        text: "Businesses collapse in their first year from poor financial planning, legal confusion and the absence of mentorship.",
        featured: true,
      },
      {
        title: "Relief instead of tools",
        text: "Communities receive short-term relief when what they actually need are long-term tools for self-reliance.",
      },
    ],
    body: "Startup E+ was built as a direct answer to that gap: a full-spectrum entrepreneurship ecosystem that takes a complete beginner from a raw idea all the way to a legally registered, financially structured and investor-ready enterprise.",
    statement: "A movement from Vadakara, for Kerala.",
    attribution: "An initiative under Shafi Parambil MP",
  },

  /* ---------- The five phases ---------- */
  phases: {
    eyebrow: "How it works",
    heading: "Five phases, from a first conversation to real capital",
    description:
      "Each phase carries a founder further than the last, and no one has to start at the beginning. The pathway meets people wherever they already are.",
    items: [
      {
        label: "Phase 01",
        title: "Building the Foundation",
        text: "Entrepreneurship begins inside schools, colleges, youth clubs and women's collectives. Dedicated Entrepreneurship Clubs (E-Clubs) introduce business thinking as a natural part of learning and community life, turning youth energy toward productive pursuits, and helping women's collectives shape everyday skills into real consumer brands and services.",
      },
      {
        label: "Phase 02",
        title: "Taking It to the People",
        text: "The Startup Caravan travels across towns, schools and colleges, bringing interactive sessions and on-the-spot registration directly to students and youth, while opening an accessible entry point for women in areas where formal business networks are harder to reach. It is also a first point of contact for struggling entrepreneurs seeking guidance.",
      },
      {
        label: "Phase 03",
        title: "Turning Ideas into Action",
        text: "Structured hackathons, run separately for students, youth and women, convert loose ideas into early business models built around real regional problems. Alongside them, a dedicated diagnostic track reviews existing struggling ventures to identify exactly what is holding them back.",
      },
      {
        label: "Phase 04",
        title: "Professional Training and Recovery",
        text: "The Startup Conclave delivers hands-on training in legal compliance, unit economics and operations, helping students and young founders structure their ideas, and women-led ventures formalise and scale. A parallel stabilisation track supports struggling businesses in correcting course and rebuilding a sustainable footing.",
      },
      {
        label: "Phase 05",
        title: "Connecting to Capital",
        text: "From validated student ideas to scaling youth businesses, formalising women-led enterprises and recovered businesses, refined ventures are presented to banks, investors and funding partners through the Investors' Meet, connecting local ideas to real growth capital.",
      },
    ],
    /* The accent tile that closes the grid */
    outcome: {
      title: "Where it leads",
      text: "A permanent, supported pathway from thought to enterprise, with a digital portal and a peer-led mentorship syndicate making sure ventures do not just launch, but survive, grow and scale.",
      cta: { label: "Register Now", href: "/#cta" },
    },
  },

  /* ---------- Stakeholders ---------- */
  stakeholders: {
    eyebrow: "Stakeholders",
    heading: "The institutions behind the movement",
    description:
      "Business, technical, industry and institutional support, brought together so a founder never has to assemble it alone.",
    items: [
      {
        name: "IIM Kozhikode",
        unit: "IIMK LIVE",
        role: "Business & strategy",
        text: "Provides paid business consultation for enterprises seeking to scale: marketing, branding, business planning, costing, fundraising and market strategy. It also runs training and masterclasses for entrepreneurs, including affordable programmes for beginners, and connects promising enterprises with experienced mentors, incubation opportunities and investor networks.",
      },
      {
        name: "NIT Calicut",
        unit: "Technology Business Incubator",
        role: "Technology & product",
        text: "Provides technical advice and business consultation on product development, technical feasibility, innovation, scalability and technology adoption, alongside technical mentoring, research facilities, intellectual property guidance and technology-related funding opportunities.",
      },
      {
        name: "Cyberpark",
        unit: "Calicut",
        role: "IT & digital industry",
        text: "Supports IT and digital enterprises through industry guidance, networking, workspace opportunities and connections with established technology companies, helping businesses build partnerships and access the digital ecosystem.",
      },
      {
        name: "Kerala Startup Mission",
        unit: "KSUM",
        role: "Incubation & funding",
        text: "Connects entrepreneurs with incubation, mentoring, training, funding opportunities and startup support programmes, while linking them to Kerala's wider innovation ecosystem.",
      },
      {
        name: "Industries & Commerce Department",
        unit: "Government of Kerala",
        role: "Registration & compliance",
        text: "Supports entrepreneurs with business registration, licensing, MSME procedures, regulatory compliance, government schemes, subsidies and institutional guidance, helping them navigate the process of establishing and operating a business.",
      },
    ],
    footnote:
      "Together, these stakeholders help entrepreneurs progress from ideas and training to business establishment, growth and long-term sustainability.",
  },

  /* ---------- Who it is for ---------- */
  audience: {
    eyebrow: "Who it's for",
    heading: "Built for anyone serious about building something that lasts",
    description:
      "At any stage of that journey: the first idea, the first hire, the first hard year, or the cheque that makes the next one possible.",
    /* `icon` maps to the lucide icon picked in about-audience.jsx */
    items: [
      {
        icon: "student",
        title: "The student",
        text: "Who wants to turn an idea into a real business while still in the classroom.",
      },
      {
        icon: "graduate",
        title: "The fresh graduate",
        text: "Ready to build a career on their own terms rather than waiting for one to be offered.",
      },
      {
        icon: "maker",
        title: "The woman with a product or a skill",
        text: "That the market deserves to know about, and that deserves to be a business.",
      },
      {
        icon: "founder",
        title: "The working entrepreneur",
        text: "Who has started something and wants to sharpen it: unit economics, legal compliance, investor communication, market strategy.",
      },
      {
        icon: "recovery",
        title: "The owner under pressure",
        text: "Who needs an honest assessment and operational support before the situation becomes irreversible.",
      },
      {
        icon: "investor",
        title: "The investor",
        text: "Institutional or diaspora, seeking a pipeline of pre-vetted, milestone-backed, market-ready founders worth backing.",
      },
    ],
  },

  /* ---------- Delivery agency ---------- */
  agency: {
    eyebrow: "Delivered by",
    heading: "WeCan Social Innovators",
    intro:
      "WeCan Social Innovators is the professional agency responsible for planning, managing and delivering every part of Startup E+.",
    body: [
      "Bringing real experience, professional discipline and deep community understanding to this mission, the agency handles every phase end to end: setting up Entrepreneurship Clubs across schools, colleges, youth clubs and women's self-help groups, running the Caravan Campaign, organising hackathons, delivering the Startup Conclave, managing the digital portal, and bringing founders and investors together at the flagship Investors' Meet.",
      "Beyond programme delivery, the agency coordinates every partner connected to this mission, from business schools and technical institutions to the Kerala Startup Mission, banks and investor networks, so that participants receive the right guidance, the right resources and the right connections at each stage of their journey.",
    ],
    responsibilities: [
      "Entrepreneurship Clubs",
      "Caravan Campaign",
      "Hackathons",
      "Startup Conclave",
      "Digital portal",
      "Investors' Meet",
      "Partner coordination",
    ],
    image: {
      src: home("team-boardroom"),
      alt: "The Startup E+ team meeting around a boardroom table",
    },
  },
};
