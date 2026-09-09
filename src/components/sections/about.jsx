import { about } from "@/data/about";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

/* Where the bright end of each card's gradient stroke sits (Figma: the three cards
   are lit from different corners). The CSS angle is the direction it fades toward,
   so 45deg lights the bottom-left, 180deg the top, 315deg the bottom-right. See .gradient-ring in styles/base.css. */
const RING_ANGLE = ["45deg", "180deg", "315deg"];

/* Highlight boxes. Figma shows white text on both; on yellow that is 1.43:1 contrast,
   so the yellow box uses dark ink (13:1). Switch back to text-background if design insists. */
const HIGHLIGHT = {
  pink: "bg-highlight-pink text-background",
  yellow: "bg-highlight-yellow text-ink-950",
};

/**
 * "What Startup E is" (Figma): near-black band, everything centred -
 * uppercase eyebrow, white h2 (54px) with pink / yellow highlight boxes,
 * three pillar cards, each ringed by a violet gradient stroke that fades out
 * (the middle one carries it further and adds a soft glow), short grey paragraph.
 * Vertical rhythm is tightened from the Figma values so the whole band fits one
 * screen below the sticky header: 749px at 1520+ (was 849px), and the lower vw
 * coefficients keep it fitting on shorter laptops (1366x768) too.
 * Cards hug their content and sit as a centred row from sm (Figma: 302 / 350 / 367px
 * at 1520), stacking full-width below that. Content lives in src/data/about.js.
 */
export function About() {
  return (
    <section id="about" className="bg-ink-1000 py-[clamp(2.5rem,3.4vw,4rem)] text-background">
      {/* Phones read the band as a normal left-aligned block at a smaller heading
          size; the centred Figma composition starts at sm, where there is room
          for it. */}
      <Container className="text-left sm:text-center">
        <span className="eyebrow text-caption text-background">{about.eyebrow}</span>

        {/* Under the h2 token (54px at the top end): at full size this headline
            ran nearly the width of the band and dwarfed the rest of the section,
            so it is capped at 34px and set tighter. */}
        <h2 className="mx-auto mt-4 max-w-[46rem] text-[1.375rem]/snug text-background sm:mt-5 sm:text-[clamp(1.375rem,0.9rem+1.7vw,2.125rem)]/snug">
          {about.headline.map((part, i) =>
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

        <ul
          role="list"
          className="mt-[clamp(1.5rem,2.7vw,3rem)] flex list-none flex-col justify-center gap-4 p-0 text-left sm:flex-row sm:flex-wrap"
        >
          {about.pillars.map((pillar, i) => (
            <li
              key={pillar.title}
              style={{ "--ring-angle": RING_ANGLE[i % RING_ANGLE.length] }}
              className={cn(
                "gradient-ring flex flex-row items-baseline gap-4 rounded-[16px] bg-[#0d0d0d] px-[clamp(1.25rem,2.6vw,2.5rem)] py-[clamp(1.25rem,2.4vw,2.25rem)] whitespace-nowrap",
                pillar.featured &&
                  "shadow-[0_0_32px_2px_rgba(167,139,250,0.18)] [--ring-strength:50%]",
              )}
            >
              <span className="font-heading text-[18px] leading-tight font-semibold text-background">
                {pillar.title}
              </span>
              <span className="text-[clamp(10px,0.75vw,12px)] leading-snug font-normal text-background/70">
                {pillar.caption}
              </span>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-[clamp(1.75rem,3vw,3.5rem)] max-w-[46rem] text-small text-background/70">
          {about.body}
        </p>
      </Container>
    </section>
  );
}
