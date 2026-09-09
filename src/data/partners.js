/**
 * "Built with Kerala's best" logo strip.
 * Replace the placeholder SVG wordmarks in public/images/partners/ with the real logos
 * (keep them roughly 160 x 48; they render ~40px tall).
 *
 * The strip is a plain centred row (src/components/sections/partners.jsx), so any
 * number works - four sit on one line on a desktop, and they wrap on phones.
 */
export const partners = {
  eyebrow: "Built with Kerala's best",
  logos: [
    { name: "Partner 1", src: "/patners-logo/partner1.png" },
    { name: "Partner 2", src: "/patners-logo/partner2.png" },
    { name: "Partner 3", src: "/patners-logo/partner3.webp" },
    { name: "Partner 4", src: "/patners-logo/partner4.png" },
  ],
};
