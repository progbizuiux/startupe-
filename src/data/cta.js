/**
 * Closing CTA banner ("Build Your Future with the Right Support").
 *
 * background: an exported band image, used as the banner's own background -
 *   the copy sits over its empty left half. Put the file in public/images/ and
 *   point `src` at it; a wide image (roughly 4:1, avatars on the right) is what
 *   the layout expects. `color` is the flat colour the art is painted on, used
 *   wherever the image does not reach (the copy area on phones).
 *
 *   It is null today. The old art (cta-bg.webp) had the previous brand blue
 *   baked into it along with the faces, so it could not follow the site to the
 *   lime palette - recolouring the field would have taken the skin tones with
 *   it. With no image the cluster is composed in code from `avatars` below and
 *   the band is a plain CSS colour, which does follow the theme.
 *
 *   To use art again: export it on the lime (#add036), drop it in, and set
 *   `color` to match. The copy on that art is near-black, not white.
 *
 * avatars: one entry per circular photo in that composed cluster - the fallback,
 *   only rendered when `background` is null.
 *   x / y  = centre position as a % of the cluster box (0-100)
 *   size   = diameter as a % of the cluster WIDTH, so the whole cluster
 *            scales with the viewport and never reflows.
 * Swap `src` for your own photos (put them in public/images/ and use
 * "/images/your-file.jpg"). Square crops work best.
 */
const unsplash = (id, w = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=facearea&facepad=2.5&w=${w}&h=${w}&q=80`;

export const cta = {
  heading: "Build Your Future with the Right Support.",
  description:
    "Connect with ideas, businesses, mentors and opportunities through Startup E+ and take the next step in your entrepreneurial journey.",
  buttons: [
    { label: "I Have an Idea", href: "/register/aspirant" },
    { label: "I Run a Business", href: "/register/beginner" },
  ],

  background: null,

  /* Cluster box is 534 x 264 in the design (aspect ~2.02)

     The faces are Kerala's own audience - students, young founders, women
     running businesses, MSME owners - rather than the generic Western stock
     portraits that shipped first. A band inviting people in should show people
     who look like the ones being invited.

     Position is independent of photo, so these can be reshuffled or swapped
     freely; the only rule worth keeping is that the larger circles hold the
     warmest, most open faces, since those are the ones actually read at size.

     `size` is a percentage of the cluster's WIDTH and currently spans 7.5 to
     11.2. The spread used to reach 14.6, which made two or three faces read as
     the subject and the rest as their backdrop - this is meant to be a crowd,
     so nothing in it should dominate. Keep the ceiling near 11 and vary the
     rest; widening the top of the range is what breaks it. */
  avatars: [
    { src: unsplash("photo-1600878459138-e1123b37cb30"), alt: "", x: 10.3, y: 12.5, size: 7.9 },
    { src: unsplash("photo-1589386417686-0d34b5903d23"), alt: "", x: 30.5, y: 18.2, size: 11.2 },
    { src: unsplash("photo-1570472050159-7c0ab6f219b0"), alt: "", x: 47.2, y: 31.1, size: 10.5 },
    { src: unsplash("photo-1609436132311-e4b0c9370469"), alt: "", x: 65.4, y: 10.2, size: 8.6 },
    { src: unsplash("photo-1637651808680-d054b0744fe8"), alt: "", x: 74.0, y: 34.8, size: 7.5 },
    { src: unsplash("photo-1533128361669-69c065857a13"), alt: "", x: 15.2, y: 48.1, size: 10.2 },
    { src: unsplash("photo-1577878317861-2a54eb46ed42"), alt: "", x: 33.3, y: 44.7, size: 8.2 },
    { src: unsplash("photo-1689600944138-da3b150d9cb8"), alt: "", x: 58.4, y: 50.0, size: 10.8 },
    { src: unsplash("photo-1598096969068-7f52cac10c83"), alt: "", x: 10.3, y: 86.4, size: 9.0 },
    { src: unsplash("photo-1695391396401-5fbb4bedafc1"), alt: "", x: 30.3, y: 76.5, size: 10.6 },
    { src: unsplash("photo-1760552069633-c05f246a5d8c"), alt: "", x: 48.5, y: 89.4, size: 10.2 },
    { src: unsplash("photo-1679138118375-47f78db3761d"), alt: "", x: 74.5, y: 77.7, size: 10.5 },
  ],
};
