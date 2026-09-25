import { aboutPage } from "@/data/about-page";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

/* Where the bright end of each card's gradient stroke sits — same three angles
   as the home "what Startup E+ is" band, so the two dark bands are lit alike. */
const RING_ANGLE = ["45deg", "180deg", "315deg"];

/* Figma shows white text on both boxes; on yellow that is 1.43:1, so the yellow
   box takes dark ink (13:1). Matches src/components/sections/about.jsx. */
const HIGHLIGHT = {
  pink: "bg-highlight-pink text-background",
  yellow: "bg-highlight-yellow text-ink-950",
};

/**
 * The near-black band: the gap Startup E+ was built to close.
 *
 * It borrows the home "what Startup E+ is" treatment — centred eyebrow, a
 * headline with pink / yellow highlight boxes, violet gradient-ringed cards on
 * near-black — but the cards here carry a title and a paragraph rather than a
 * one-line pillar, so the band reads as that section's sibling rather than a
 * copy of it. It closes on the movement statement, set off by a hairline rule.
 */
export function AboutMission() {
  const { mission } = aboutPage;

  return (
    <section id="mission" className="bg-ink-1000 py-[clamp(3rem,5.5vw,5.5rem)] text-background">
      {/* Phones read the band as a left-aligned block; the centred composition
          starts at sm, where there is room for it. */}
      <Container className="text-left sm:text-center">
        <div data-reveal>
          <span className="eyebrow text-caption text-background">{mission.eyebrow}</span>

          <h2 className="mx-auto mt-4 max-w-[46rem] text-[1.375rem]/snug text-background sm:mt-5 sm:text-[clamp(1.375rem,0.9rem+1.7vw,2.125rem)]/snug">
            {mission.headline.map((part, i) =>
              typeof part === "string" ? (
                part
              ) : (
                <span
                  key={i}
                  className={cn(
                    "mx-0.5 inline-block px-2 py-0.5 leading-tight sm:mx-1 sm:px-3 sm:py-1",
                    HIGHLIGHT[part.highlight],
                  )}
                >
                  {part.text}
                </span>
              ),
            )}
          </h2>
        </div>

        {/* the three cards arrive one after another — a short stagger, so the
            row reads left to right rather than snapping in as a slab */}
        <ul
          data-reveal="stagger"
          role="list"
          className="mt-[clamp(2rem,3.4vw,3.5rem)] grid list-none gap-4 p-0 text-left sm:grid-cols-3"
        >
          {mission.gaps.map((gap, i) => (
            <li
              key={gap.title}
              style={{ "--ring-angle": RING_ANGLE[i % RING_ANGLE.length] }}
              className={cn(
                "gradient-ring rounded-[16px] bg-[#0d0d0d] px-[clamp(1.25rem,2.2vw,2rem)] py-[clamp(1.25rem,2vw,2rem)]",
                gap.featured &&
                  "shadow-[0_0_32px_2px_rgba(167,139,250,0.18)] [--ring-strength:50%]",
              )}
            >
              <h3 className="font-heading text-[18px] leading-snug font-semibold text-background">
                {gap.title}
              </h3>
              <p className="mt-3 text-small text-background/70">{gap.text}</p>
            </li>
          ))}
        </ul>

        <p
          data-reveal
          className="mx-auto mt-[clamp(2rem,3vw,3.5rem)] max-w-[52rem] text-small text-background/70"
        >
          {mission.body}
        </p>

        <div
          data-reveal
          className="mt-[clamp(2rem,3.4vw,3.5rem)] border-t border-background/10 pt-[clamp(1.75rem,2.6vw,2.75rem)]"
        >
          <p className="font-heading text-[clamp(1.375rem,0.9rem+1.7vw,2.125rem)] leading-snug font-medium tracking-[-0.02em] text-background">
            {mission.statement}
          </p>
          <span className="mt-3 eyebrow text-caption text-background/60">
            {mission.attribution}
          </span>
        </div>
      </Container>
    </section>
  );
}
