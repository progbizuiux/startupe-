/**
 * "Built with Kerala's best" logo strip.
 * The files live in public/patners-logo/ (note the spelling - that is the real
 * folder name). They are square-ish source images, 1200-2200px, and the strip
 * sizes them with object-contain, so a logo only needs to be square-ish and
 * trimmed of its own padding; Next's image optimiser does the resizing.
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
    { name: "We Can Social Innovators", src: "/patners-logo/we-can.png" },
  ],
};
