import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { AboutPhases } from "@/components/sections/about-phases";
import { AboutAudience } from "@/components/sections/about-audience";
import { Partners } from "@/components/sections/partners";
import { Join } from "@/components/sections/join";
import { Message } from "@/components/sections/message";
import { Faq } from "@/components/sections/faq";
import { Cta } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Message />
      <About />
      {/* "How it works", then "who it's for". Both components still live in
          src/components/sections/about-*.jsx and read src/data/about-page.js,
          which is now where their copy lives rather than where they render —
          they were moved off the About page, not shared with it.

          The order is the narrative one: About says what this is, Phases says
          how it works, Audience says who it is for, and only then does Partners
          say who stands behind it. Both are 3 x 2 card grids, which would be a
          repeat if they matched; they do not — Phases is grey cards on white
          with the numeral as a watermark, Audience is white cards on a grey
          band with icon tiles, so the second reads as the answer to the first
          rather than more of the same. Phases is also kept clear of <Join />
          below, which draws the same card shape as Phases does.

          No <ScrollReveal /> is mounted on this page, so the `data-reveal`
          markers in both sections do nothing here and they simply render. That
          is deliberate: nothing else on the home page reveals on scroll, and
          one animated section among static ones reads as a glitch rather than
          a flourish. */}
      <AboutPhases />
      <AboutAudience />
      <Partners />
      <Join />
      <Cta />
      {/* Last, after the CTA, so the band is what someone scrolling past the
          content hits first and the questions are there for whoever keeps
          going. It was commented out while src/data/faq.js still held Lorem
          Ipsum. Because it renders after <Cta />, that section's bottom margin
          drops away (see `last:mb-section` in cta.jsx) and this section's own
          top padding sets the gap. */}
      <Faq />
    </>
  );
}
