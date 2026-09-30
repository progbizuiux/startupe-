import Image from "next/image";
import { aboutPage } from "@/data/about-page";
import { Container } from "@/components/ui/container";

/**
 * The delivery agency, built on the home "message" layout: a rounded image card
 * on the left from lg (41% of the content width, 6% gutter), the copy on the
 * right. The copy comes first in the source so phones read who the agency is
 * before the photo; `lg:order-first` puts the photo back on the left from lg up.
 */
export function AboutAgency() {
  const { agency } = aboutPage;

  /* On the grey band because it is now the last long section before the CTA.
     That job used to belong to "Who it's for", which sat between this and the
     stakeholder list and has since moved to the home page; without a band
     somewhere in here the page runs about 2,100px of unbroken white between the
     dark mission band and the indigo CTA. It goes on this section rather than
     the stakeholder list above because that list is ruled rows carrying small
     `bg-muted` pills, which a grey band would wash out. */
  return (
    <section id="agency" className="bg-muted section-y">
      <Container>
        {/* No `items-center`: from lg the two columns stretch to the same height
            and the photo is cropped to whatever the copy comes out to, so the
            block reads as one rectangle rather than a short photo floating
            beside a taller column. */}
        <div className="grid gap-10 lg:grid-cols-[41%_1fr] lg:gap-x-[6%]">
          <div data-reveal className="lg:max-w-[46rem]">
            <span className="eyebrow text-muted-foreground">{agency.eyebrow}</span>
            <h2 className="mt-4 text-h3">{agency.heading}</h2>
            <p className="mt-5 text-lead text-foreground/85">{agency.intro}</p>

            {agency.body.map((paragraph, i) => (
              <p key={i} className="mt-5 text-small">
                {paragraph}
              </p>
            ))}

            <ul role="list" className="mt-7 flex list-none flex-wrap gap-2 p-0">
              {agency.responsibilities.map((item) => (
                <li
                  key={item}
                  className="rounded-button border border-border px-4 py-2 text-caption font-medium"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Photo card. Stacked below lg it closes the section, kept centred and
              capped so it never fills a whole phone screen — it needs the 480 x 546
              ratio there to have any height at all. From lg the ratio is dropped
              (`aspect-auto`) and the card takes the row's height instead, which is
              the copy's height. */}
          <div
            data-reveal
            className="relative mx-auto aspect-[480/546] w-full overflow-hidden rounded-card-lg bg-muted sm:max-w-[22rem] lg:order-first lg:mx-0 lg:aspect-auto lg:h-full lg:w-full lg:max-w-none lg:justify-self-end"
          >
            <Image
              src={agency.image.src}
              alt={agency.image.alt}
              fill
              sizes="(min-width: 64rem) 38vw, (min-width: 40rem) 22rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
