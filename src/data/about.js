/**
 * "What Startup E is" section content.
 * headline: strings render as plain text; { text, highlight } renders a coloured box
 * (highlight = "pink" | "yellow", see src/components/sections/about.jsx).
 */
export const about = {
  eyebrow: "What Startup E+ is",

  headline: [
    "A youth-focused entrepreneurial movement that ",
    { text: "connects ideas,", highlight: "pink" },
    " people and resources to turn ambition into ",
    { text: "real opportunities", highlight: "yellow" },
  ],

  /* Three pillar cards; `featured` gets the blue outline */
  pillars: [
    { title: "Evolve", caption: "For New Ideas" },
    { title: "Elevate", caption: "For Growing Businesses", featured: true },
    { title: "Empower", caption: "For Mentors & Experts" },
  ],

  body: "Every Year Kerala Produces Thousands Of Graduates With Ideas, And Thousands Of Small Business Owners Who Have Run Out Of Road. Very Few Of Them Have A Clear Path Forward. Startup E+ Is That Path — A Single Pipeline From Raw Idea To Registered, Funded Company, Built With IIM Kozhikode, NIT Calicut, IIT Madras And Kerala Startup Mission.",
};
