import { Cta } from "@/components/sections/cta";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AboutHero } from "@/components/sections/about-hero";
import { AboutStory } from "@/components/sections/about-story";
import { AboutMission } from "@/components/sections/about-mission";
import { AboutPhases } from "@/components/sections/about-phases";
import { AboutStakeholders } from "@/components/sections/about-stakeholders";
import { AboutAudience } from "@/components/sections/about-audience";
import { AboutAgency } from "@/components/sections/about-agency";

export const metadata = {
  title: "About",
  description:
    "Startup E+ is an entrepreneurship initiative by Shafi Parambil MP — five phases from idea to investment, built with IIM Kozhikode, NIT Calicut, Cyberpark and Kerala Startup Mission.",
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
      <AboutPhases />
      <AboutStakeholders />
      <AboutAudience />
      <AboutAgency />
      <Cta />
    </>
  );
}
