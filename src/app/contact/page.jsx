import { ContactHero } from "@/components/sections/contact-hero";
import { ContactForm } from "@/components/sections/contact-form";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

/* Bare title: the root layout applies the "%s | Startup E+" template, so
   spelling the site name here would print it twice. */
export const metadata = {
  title: "Contact",
  description:
    "Write to the Startup E+ team in Vadakara, or reach the office directly by email, WhatsApp or phone.",
  alternates: { canonical: "/contact" },
};

/**
 * /contact — a heading, then the address and a message form side by side.
 * Nothing else.
 *
 * It does not close on the shared <Cta /> band the way / and /about do. That is
 * deliberate: the band's job is to push people into the registration portals,
 * and someone already writing a message has chosen a different route. Adding it
 * back is one import and one line if the page should end like the others.
 *
 * Structured data is deliberately out of scope. A ContactPoint or LocalBusiness
 * block is the obvious win on this page, but the street address and opening
 * hours are not on file yet (see src/data/contact.js), and marking up a partial
 * address is worse than marking up none.
 */
export default function ContactPage() {
  return (
    <>
      {/* one client island drives every `data-reveal` block on the page; the
          sections themselves stay server components */}
      <ScrollReveal />
      <ContactHero />
      <ContactForm />
    </>
  );
}
