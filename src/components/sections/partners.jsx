import Image from "next/image";
import { partners } from "@/data/partners";
import { Container } from "@/components/ui/container";

/**
 * "Built with Kerala's best" (Figma): centred eyebrow, ~65px below it a strip of
 * light-grey logo cards (~268 x 147px at 1520, ~33px apart).
 *
 * The strip scrolls at every width. The list is rendered twice and the track
 * slides by exactly half its width, which is why the spacing is a margin on
 * each card and not a flex `gap` - a gap would add half a gap of drift on
 * every loop. The second copy is hidden from screen readers.
 *
 * Because the two copies are adjacent, the loop is seamless at any viewport,
 * including one wider than a single copy of the list.
 *
 * It runs slower above sm than on a phone in wall-clock terms, because the
 * cards are bigger there: 30s rather than 20s keeps the logos moving past at
 * roughly the same speed on the screen, which is what the eye actually reads.
 *
 * Under prefers-reduced-motion it is not a slowed-down marquee but a different
 * thing: a still, centred, wrapped row with the duplicate copy dropped, which
 * is the layout this strip had before it scrolled. A marquee that merely
 * stopped would leave a half-scrolled track clipped mid-logo.
 *
 * It stays a server component: all of this is CSS, and the animation pauses on
 * hover and on keyboard focus.
 *
 * Content lives in src/data/partners.js - any number of logos works.
 */
export function Partners() {
  const loop = [...partners.logos, ...partners.logos];

  return (
    <section id="partners" className="pt-section text-center">
      <span className="eyebrow text-muted-foreground">{partners.eyebrow}</span>

      <Container className="mt-[clamp(1.75rem,4.3vw,4.0625rem)]">
        <div className="-mx-gutter no-scrollbar overflow-hidden motion-reduce:mx-0 motion-reduce:overflow-visible">
          <ul
            role="list"
            className="flex w-max animate-marquee items-center focus-within:[animation-play-state:paused] hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-[clamp(1rem,2.2vw,2rem)] sm:[animation-duration:30s]"
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
                       how big they come out.

                       The margin is what spaces the cards, at every width - the
                       track is measured in whole copies of the list, so the
                       spacing has to belong to the card rather than sit between
                       cards as a flex gap. Only the reduced-motion layout, which
                       does not loop, can afford a real gap. */
                    "mr-[clamp(1rem,2.2vw,2rem)] h-[clamp(5rem,9.7vw,9.25rem)] w-[clamp(9.5rem,15.5vw,13.5rem)] shrink-0 rounded-card bg-muted px-6 py-3 motion-reduce:mr-0 sm:px-8 sm:py-6 " +
                    (isCopy ? "motion-reduce:hidden" : "")
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
