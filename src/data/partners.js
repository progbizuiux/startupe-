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
    { name: "IIM Kozhikode", src: "/patners-logo/iim-kozhikode.png" },
    { name: "NIT Calicut", src: "/patners-logo/nit-calicut.png" },
    { name: "Cyberpark", src: "/patners-logo/cyberpark.png" },
    { name: "Progbiz", src: "/patners-logo/progbiz.webp" },
  ],
};
