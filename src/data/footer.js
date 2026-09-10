import { siteConfig } from "@/config/site";

/**
 * Footer content (Figma): description + social icons | Quick Links | Contact | Address.
 * Social links and contact details come from siteConfig (src/config/site.js).
 * A column with `nav: true` is rendered as a <nav> landmark; others are plain groups.
 */
export const footer = {
  /* Sits above the social icons. Optional - set it to "" and the icons move up. */
  description:
    "Startup E+ connects Kerala's aspiring and early-stage entrepreneurs with the mentors, resources and opportunities they need to grow. An initiative by Shafi Parambil MP.",

  columns: [
    {
      title: "Quick Links",
      nav: true,
      links: [
        { label: "Register", href: "/#cta" },
        { label: "Process", href: "/#message" }, // point at the "How it works" section once it exists
        // { label: "Faq", href: "/#faq" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
        ...siteConfig.contact.phones.map((phone) => ({
          label: phone,
          href: `tel:${phone.replace(/[^\d+]/g, "")}`,
        })),
      ],
    },
  ],

  /* One entry per line of the address, in the order it should be read */
  address: {
    title: "Address",
    lines: ["MP Office", "Vadakara"],
  },

  copyright: "All Rights Reserved",

  /* Studio credit: its own centred row at the very bottom of the footer.
     Drop `href` to render it as plain text instead of a link. */
  credit: { label: "Designed by Progbiz", href: "https://progbiz.io" },
};
