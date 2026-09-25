import { RegisterHero } from "@/components/sections/register-hero";
import { RegisterSteps } from "@/components/sections/register-steps";
import { RegisterPass } from "@/components/sections/register-pass";
import { RegisterForm } from "@/components/sections/register-form";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

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
 * Ordered to explain before it asks — the user's brief was a section that makes
 * the process and the reward clear, and both of those are worthless below the
 * form. The two honest limits on the pass (issued once, not a credential) are
 * stated in #pass for the same reason.
 *
 * It does not close on the shared <Cta /> band: that band's job is to push
 * people into the two portals, which is exactly what this page's own success
 * panel does with the pathway the person just chose, so the band would be
 * asking again and less precisely.
 */
export default function RegisterPage() {
  return (
    <>
      {/* one client island drives every `data-reveal` block on the page; the
          sections themselves stay server components */}
      <ScrollReveal />
      <RegisterHero />
      <RegisterSteps />
      <RegisterPass />
      <RegisterForm />
    </>
  );
}
