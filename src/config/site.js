/**
 * Site-wide settings. Edit once, used everywhere
 * (metadata, header, footer, sitemap, OG tags).
 *
 * Nav items: { label, href, external? }  (labels are shown uppercase by CSS)
 */
export const siteConfig = {
  name: "Start-Up",
  tagline: "Your one-line tagline goes here.",
  description: "Short description of the company / product for search engines and social previews.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  locale: "en_US",

  /* Header: centered links. All three point at sections of the home page, so
     they work from any route (a bare "#about" would only scroll on "/"). */
  nav: [
    { label: "About", href: "/#about" }, // "What Startup E is" band
    { label: "Partners", href: "/#partners" }, // "Built with Kerala's best" strip
    { label: "Register", href: "/#cta" }, // closing CTA band
  ],

  /* Header: right-side button (desktop header and the mobile menu) */
  cta: { label: "Join the Movement", href: "/register/beginner" },

  /* Footer social icons (keys must match src/components/ui/social-icons.jsx).
     The footer renders one icon per entry, so an account without a real URL is
     simply left out rather than shipped as a dead link. X and LinkedIn glyphs are
     still defined in social-icons.jsx - add the key back here with a real profile
     URL and the icon returns. */
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61594291859742",
    instagram: "https://www.instagram.com/startup_eplus",
  },

  /* Footer "Contact" column */
  contact: {
    email: "startupvadakara@gmail.com",
    phones: ["+91 88917 44957"],
  },
};
