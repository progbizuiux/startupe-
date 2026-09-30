import { RegisterForm } from "@/components/sections/register-form";

/* Bare title: the root layout applies the "%s | Startup E+" template, so
   spelling the site name here would print it twice. */
export const metadata = {
  title: "Register",
  description:
    "Register for Startup E+ in about a minute. You get a registration ID and a downloadable pass, then a route into the right portal for your detailed application.",
  alternates: { canonical: "/register" },
};

/**
 * /register — the front door to the programme.
 *
 * This page previously did not exist: siteConfig.nav and the footer both sent
 * "Register" to the home page's CTA band, and /register/aspirant and
 * /register/beginner sat underneath a route with no parent.
 *
 * It is one section — heading and form. No <ScrollReveal /> either: with
 * nothing below the fold there is no block for it to reveal, and the heading
 * animates in with CSS instead. Adding it back would ship a client island that
 * does nothing.
 *
 * It does not close on the shared <Cta /> band: that band's job is to push
 * people into the two portals, which is exactly what this page's own success
 * panel does with the pathway the person just chose.
 */
export default function RegisterPage() {
  return <RegisterForm />;
}
