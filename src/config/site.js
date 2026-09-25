/**
 * Site-wide settings. Edit once, used everywhere
 * (metadata, header, footer, sitemap, OG tags).
 *
 * Nav items: { label, href, external? }  (labels are shown uppercase by CSS)
 */
export const siteConfig = {
  name: "Startup E+",
  /* Pair the name in the browser tab and search results; keep the two together
     under ~60 characters so Google does not truncate the title. */
  tagline: "Kerala's Startup & MSME Movement",
  /* Kept under ~155 characters: past that Google truncates it in results. */
  description:
    "A pan-Kerala movement from the Office of MP Shafi Parambil, connecting students, founders and MSMEs with mentors, funding and institutional support.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://startupeplus.com",
  ogImage: "/og.png",
  locale: "en_IN",

  /* Header: centered links. The two anchors are written with the leading "/" so
     they work from any route (a bare "#partners" would only scroll on "/"). */
  nav: [
    { label: "About", href: "/about" }, // the About page
    { label: "Partners", href: "/#partners" }, // "Built with Kerala's best" strip
    { label: "Contact", href: "/contact" }, // the Contact page
    { label: "Register", href: "/register" }, // the Register page
  ],

  /* Header: right-side button (desktop header and the mobile menu) */
  cta: { label: "Join the Movement", href: "/register" },

  /* Footer social icons (keys must match src/components/ui/social-icons.jsx).
     The footer renders one icon per entry, so an account without a real URL is
     simply left out rather than shipped as a dead link. X and LinkedIn glyphs are
     still defined in social-icons.jsx - add the key back here with a real profile
     URL and the icon returns. */
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61594291859742",
    instagram: "https://www.instagram.com/startup_eplus",
  },

  /* Footer "Contact" column and the /contact page. The single source of truth
     for how to reach the office - nothing should hard-code an address or a
     number, or the site ends up with two of them that drift apart. */
  contact: {
    email: "startupvadakara@gmail.com",
    phones: ["+91 88917 44957"],
    /* The same line, confirmed as reachable on WhatsApp. Set it to null if that
       ever stops being true: the contact page drops the WhatsApp channel card
       and the "WhatsApp" reply option on its own rather than linking into a
       chat nobody reads. */
    whatsapp: "+91 88917 44957",
    /* Postal address, one entry per line as it should be read. There is no
       street or PIN on file yet - add the lines here and the footer and the
       contact page both pick them up. */
    address: ["MP Office", "Vadakara"],
  },
};
