/**
 * Closing CTA banner ("Build Your Future with the Right Support").
 *
 * background: the exported band art, used as the banner's own background - the
 *   copy sits over its empty left half. Put the file in public/images/ and point
 *   `src` at it; a wide image (roughly 4:1, avatars on the right) is what the
 *   layout expects. `color` is the flat blue the art is painted on - the band
 *   uses it wherever the image does not reach (the copy on phones), since it is
 *   a different blue from the brand indigo. Set `background: null` to go back to
 *   the avatar cluster that is composed in code from `avatars` below.
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
    "Connect with ideas, businesses, mentors and opportunities through Startup E — and take the next step in your entrepreneurial journey.",
  buttons: [
    { label: "I Have an Idea", href: "/register/beginner" },
    { label: "I Run a Business", href: "/register/aspirant" },
  ],

  background: { src: "/images/cta-bg.webp", color: "#3562f0" },

  /* Cluster box is 534 x 264 in the design (aspect ~2.02) */
  avatars: [
    { src: unsplash("photo-1500648767791-00dcc994a43e"), alt: "", x: 10.3, y: 12.5, size: 7.9 },
    { src: unsplash("photo-1507003211169-0a1dd7228f2d"), alt: "", x: 30.5, y: 18.2, size: 14.6 },
    { src: unsplash("photo-1506794778202-cad84cf45f1d"), alt: "", x: 47.2, y: 31.1, size: 10.5 },
    { src: unsplash("photo-1534528741775-53994a69daeb"), alt: "", x: 65.4, y: 10.2, size: 8.6 },
    { src: unsplash("photo-1531123897727-8f129e1688ce"), alt: "", x: 74.0, y: 34.8, size: 7.5 },
    { src: unsplash("photo-1463453091185-61582044d556"), alt: "", x: 15.2, y: 48.1, size: 11.6 },
    { src: unsplash("photo-1521119989659-a83eee488004"), alt: "", x: 33.3, y: 44.7, size: 8.2 },
    { src: unsplash("photo-1517841905240-472988babdf9"), alt: "", x: 58.4, y: 50.0, size: 13.9 },
    { src: unsplash("photo-1544005313-94ddf0286df2"), alt: "", x: 10.3, y: 86.4, size: 9.0 },
    { src: unsplash("photo-1489424731084-a5d8b219a5bb"), alt: "", x: 30.3, y: 76.5, size: 13.5 },
    { src: unsplash("photo-1494790108377-be9c29b29330"), alt: "", x: 48.5, y: 89.4, size: 11.6 },
    { src: unsplash("photo-1438761681033-6461ffad8d80"), alt: "", x: 74.5, y: 77.7, size: 10.5 },
  ],
};
