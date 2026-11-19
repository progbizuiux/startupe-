import Image from "next/image";
import Link from "next/link";
import { sponsors } from "@/data/sponsors";
import { Container } from "@/components/ui/container";

/**
 * "Our sponsors": centred eyebrow, heading and intro, then a grid of logo cards.
 *
 * Renders NOTHING while src/data/sponsors.js has no entries - an empty heading
 * over an empty grid announces that there are no sponsors, which is worse than
 * not raising the subject. Add a row there and the whole section appears.
 *
 * Deliberately not the <Partners /> treatment, even though both are rows of
 * logos: that strip is grey cards with an eyebrow only, this is bordered cards
 * on white with a heading. Two identical strips a screen apart would read as
 * one component rendered twice by mistake.
 *
 * Responsive behaviour, which is flex-wrap rather than a grid on purpose:
 *   - 2 across on phones, 3 from sm, 4 from lg, via explicit basis widths that
 *     subtract their share of the gap, so the rows are exact at every size.
 *   - `justify-center` keeps a part-full last row centred. A CSS grid would
 *     hang those last one or two cards to the left, which looks like a mistake
 *     when a sponsor count is not a multiple of the column count - and the
 *     count here is whatever it happens to be.
 *   - the logo box itself is a clamp, so the marks scale with the viewport
 *     instead of stepping at each breakpoint.
 *
 * Server component: nothing here is interactive.
 */
export function Sponsors() {
  if (sponsors.logos.length === 0) return null;

  return (
    <section id="sponsors" className="section-y">
      <Container>
        <div className="text-center">
          <span className="eyebrow text-muted-foreground">{sponsors.eyebrow}</span>
          <h2 className="mt-4 text-h3">{sponsors.heading}</h2>
          {sponsors.description ? (
            <p className="mx-auto mt-5 max-w-[46rem] text-muted-foreground">
              {sponsors.description}
            </p>
          ) : null}
        </div>

        <ul
          role="list"
          className="mt-[clamp(2rem,4.3vw,3.5rem)] flex list-none flex-wrap justify-center gap-4 p-0 sm:gap-6"
        >
          {sponsors.logos.map((sponsor) => {
            /* A card is a link only when the sponsor has a URL. Wrapping a
               plain card in an <a href=""> to keep the markup uniform would
               hand a keyboard user a tab stop that goes nowhere. */
            const Card = sponsor.href ? Link : "div";
            const cardProps = sponsor.href
              ? { href: sponsor.href, target: "_blank", rel: "noreferrer" }
              : {};

            return (
              <li
                key={sponsor.name}
                className="basis-[calc(50%-0.5rem)] sm:basis-[calc(33.333%-1rem)] lg:basis-[calc(25%-1.125rem)]"
              >
                <Card
                  {...cardProps}
                  className={
                    "flex h-full items-center justify-center rounded-card border border-border bg-background px-5 py-7 sm:px-7 sm:py-9" +
                    (sponsor.href ? " transition-colors hover:border-lime hover:bg-muted" : "")
                  }
                >
                  {/* a contain box rather than a fixed image height: these marks
                      are a mix of square and wide, and scaling each to fit one
                      box is what makes them look evenly weighted next to each
                      other */}
                  <span className="relative block h-[clamp(2.25rem,4.5vw,3.25rem)] w-full">
                    <Image
                      src={sponsor.src}
                      alt={sponsor.name}
                      fill
                      sizes="(min-width: 64rem) 22vw, (min-width: 40rem) 30vw, 45vw"
                      className="object-contain"
                    />
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
