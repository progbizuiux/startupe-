import { Cta } from "@/components/sections/cta";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AboutHero } from "@/components/sections/about-hero";
import { AboutStory } from "@/components/sections/about-story";
import { AboutMission } from "@/components/sections/about-mission";
import { AboutStakeholders } from "@/components/sections/about-stakeholders";
import { AboutAgency } from "@/components/sections/about-agency";

export const metadata = {
  title: "About",
  description:
    "Startup E+ is an entrepreneurship initiative by Shafi Parambil MP: five phases from idea to investment, built with IIM Kozhikode, NIT Calicut, Cyberpark and Kerala Startup Mission.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      {/* one client island drives every `data-reveal` block on the page; the
          sections themselves stay server components */}
      <ScrollReveal />
      <AboutHero />
      <AboutStory />
      <AboutMission />
      {/* "How it works" and "Who it's for" used to sit here; both now render on
          the home page instead. Their copy still lives in the `phases` and
          `audience` keys of src/data/about-page.js, beside the copy this page
          does use — the file is the About CONTENT, not a map of this route. */}
      <AboutStakeholders />
      <AboutAgency />
      <Cta />
    </>
  );
}
