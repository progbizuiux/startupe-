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

    /* These five also appear in the sponsors grid further down the page, and
       they point at the same files rather than a second copy in this folder -
       one logo stored twice is one that gets updated once. The folder a file
       sits in says nothing about which sections may use it. */
    { name: "Ordine Corporate Solutions LLP", src: "/sponsors-logo/ordine.png" },
    { name: "Trade Max Academy", src: "/sponsors-logo/trade-max-academy.png" },
    { name: "BNI Calicut", src: "/sponsors-logo/bni-calicut.png" },
    { name: "The OG Club FM", src: "/sponsors-logo/og-club-fm.png" },
    { name: "Finquo Junior", src: "/sponsors-logo/finquo-junior.png" },
  ],
};
