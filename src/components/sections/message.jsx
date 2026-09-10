import Image from "next/image";
import { message } from "@/data/message";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

/**
 * "A message from ..." (Figma): cut-out portrait on a blue rounded card on the left
 * (41% of the content width), heading, quote with a gold left rule, and name / role
 * on the right (53%, after a 6% gap), vertically centred with the card.
 * The heading is an array of parts so a name can be set bold; content lives in
 * src/data/message.js.
 */
export function Message() {
  const { image } = message;

  return (
    <section id="message" className="section-y">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[41%_1fr] lg:gap-x-[6%]">
          {/* Text. It comes first in the source so that on phones the message is
              read (and shown) before the portrait; `lg:order-first` on the card
              below puts the portrait back on the left from lg up. Sizes come from
              the type scale rather than fixed px so the heading scales down on
              phones like every other section, and the colours are tokens so the
              block survives dark mode. */}
          <div className="lg:max-w-[46rem]">
            <h2 className="text-h3">
              {message.heading.map((part, i) =>
                typeof part === "string" ? (
                  part
                ) : (
                  <strong key={i} className={part.bold ? "font-bold" : undefined}>
                    {part.text}
                  </strong>
                ),
              )}
            </h2>

            <figure className="mt-6">
              <blockquote className="border-l-[3px] border-foreground py-1 pl-6">
                <p className="text-lead text-foreground/85">{message.quote}</p>
              </blockquote>

              <figcaption className="mt-6">
                <span className="block text-[15px] font-bold text-foreground">{message.name}</span>
                <span className="block text-[13px] font-medium text-muted-foreground">
                  {message.role}
                </span>
              </figcaption>
            </figure>
          </div>

          {/* Portrait card. Stacked (below lg) it closes the section under the
              quote, kept small and centred so it never fills a whole phone
              screen. From lg it moves back into the left column and keeps the
              Figma 480 x 546 ratio at 86% of that column. */}
          <div className="relative mx-auto aspect-[480/546] w-full overflow-hidden rounded-card-lg bg-brand-500/11 sm:max-w-[22rem] lg:order-first lg:mx-0 lg:w-[86%] lg:max-w-none lg:justify-self-end">
            {/* The portrait is bottom-aligned inside this inset, which leaves the
                headroom the design keeps above the head (Figma: ~9% of the card).
                next/image `fill` writes inset:0 inline, so the offset has to live
                on a wrapper rather than a class on the image itself. */}
            <div className="absolute inset-x-0 top-[var(--portrait-headroom,9%)] bottom-0">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 64rem) 38vw, (min-width: 40rem) 22rem, 100vw"
                className={cn(
                  image.fit === "contain" ? "object-contain object-bottom" : "object-cover",
                )}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
