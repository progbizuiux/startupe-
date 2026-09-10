/**
 * Home page hero content. Edit copy + images here.
 * Gallery photos are the Figma exports in public/images/home-page/.
 * The mentor avatars are still Unsplash placeholders - swap `src` for real files.
 */
/* Hero gallery photos exported from Figma; see public/images/home-page/ */
const home = (name) => `/images/home-page/${name}.webp`;

const unsplash = (id, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const hero = {
  /* Each entry is one line of the headline; the highlight is appended to the last line */
  titleLines: ["Together, We Build", "What's "],
  titleHighlight: "Next",

  description:
    "A connected ecosystem helping Kerala’s entrepreneurs and businesses turn ideas into opportunities, growth, and impact",

  cta: { label: "See how it works", href: "#message" }, // point at the "How it works" section once it exists

  stat: {
    value: "20+",
    label: "Mentors & Experts",
    avatars: [
      { src: unsplash("photo-1494790108377-be9c29b29330", 160), alt: "Mentor" },
      { src: unsplash("photo-1507003211169-0a1dd7228f2d", 160), alt: "Mentor" },
      { src: unsplash("photo-1438761681033-6461ffad8d80", 160), alt: "Mentor" },
    ],
  },

  /**
   * Photo strip: 5 bottom-aligned columns filling the page width, each with 1 or 2
   * stacked photos. `width` sets the column's share of the row and, with `height`,
   * the photo's aspect ratio (values measured from the Figma design).
   * Photos live in public/images/home-page/ and are ordered to match the design.
   */
  gallery: [
    {
      width: 327,
      images: [
        {
          src: home("workshop-whiteboard"),
          alt: "Workshop session around a whiteboard",
          height: 375,
        },
        { src: home("designer-desk"), alt: "Designer working at a desk", height: 240 },
      ],
    },
    {
      width: 308,
      images: [{ src: home("tablet-portfolio"), alt: "Design work on a tablet", height: 436 }],
    },
    {
      width: 538,
      /* the lead photo on phones, where the five-column strip collapses to one */
      mobile: true,
      images: [{ src: home("open-office"), alt: "Team working in an open office", height: 583 }],
    },
    {
      width: 309,
      images: [{ src: home("mentor-session"), alt: "Mentor talking with a group", height: 430 }],
    },
    {
      width: 307,
      images: [
        { src: home("speaker-presenting"), alt: "Speaker presenting to an audience", height: 375 },
        { src: home("classroom-question"), alt: "Student asking a question in class", height: 240 },
      ],
    },
  ],
};
