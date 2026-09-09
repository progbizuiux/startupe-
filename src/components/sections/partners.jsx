import Image from "next/image";
import { partners } from "@/data/partners";
import { Container } from "@/components/ui/container";

/**
 * "Built with Kerala's best" (Figma): centred eyebrow, ~65px below it a strip of
 * light-grey logo cards (~268 x 147px at 1520, ~33px apart).
 *
 * Two behaviours from one list:
 *   - phones: the cards do not fit on a line, so rather than wrapping to a 2x2
 *     block they run edge to edge as a marquee. The list is rendered twice and
 *     the track slides by exactly half its width, which is why the spacing there
 *     is a margin on each card and not a flex `gap` - a gap would add half a gap
 *     of drift on every loop. The second copy is hidden from screen readers.
 *   - sm and up: all four sit still in one centred row, so there is nothing
 *     moving and no pause control to offer. The duplicate copy is dropped.
 *
 * It stays a server component: the animation and the switch between the two are
 * pure CSS, and it pauses on hover / keyboard focus and under
 * prefers-reduced-motion, where the strip becomes a static row you can swipe.
 *
 * Content lives in src/data/partners.js - any number of logos works.
 */
export function Partners() {
  const loop = [...partners.logos, ...partners.logos];

  return (
    <section id="partners" className="pt-section text-center">
      <span className="eyebrow text-muted-foreground">{partners.eyebrow}</span>

      <Container className="mt-[clamp(1.75rem,4.3vw,4.0625rem)]">
        <div className="-mx-gutter no-scrollbar overflow-hidden motion-reduce:overflow-x-auto sm:mx-0 sm:overflow-visible">
          <ul
            role="list"
            className="flex w-max animate-marquee items-center focus-within:[animation-play-state:paused] hover:[animation-play-state:paused] motion-reduce:animate-none sm:w-full sm:animate-none sm:flex-wrap sm:justify-center sm:gap-[clamp(1rem,2.2vw,2rem)]"
          >
            {loop.map((logo, i) => {
              const isCopy = i >= partners.logos.length;
              return (
                <li
                  key={i}
                  aria-hidden={isCopy ? "true" : undefined}
                  className={
                    /* tighter vertical than horizontal padding: most of these
                       marks are square, so it is the card's height that decides
                       how big they come out */
                    "mr-[clamp(1rem,2.2vw,2rem)] h-[clamp(5rem,9.7vw,9.25rem)] w-[clamp(9.5rem,17.6vw,16.75rem)] shrink-0 rounded-card bg-muted px-6 py-3 sm:mr-0 sm:px-8 sm:py-6 " +
                    (isCopy ? "sm:hidden" : "")
                  }
                >
                  {/* a contain box rather than a fixed logo height: the real logos
                      are a mix of square and wide marks, so scaling each to fit
                      the same box is what keeps them optically even */}
                  <span className="relative block size-full">
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      fill
                      sizes="(min-width: 40rem) 18vw, 45vw"
                      className="object-contain"
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
