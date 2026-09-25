import Image from "next/image";
import { aboutPage } from "@/data/about-page";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

/**
 * /about hero. Deliberately built on the same bones as the home hero
 * (src/components/sections/hero.jsx): the faint grid background, the h1 with a
 * gradient last phrase on the left, the intro paragraph held in a narrow column
 * on the right, and a photo band underneath — so the page reads as the same site
 * from the first screen.
 *
 * What differs is the right column: the home page carries social proof there,
 * this one carries three figures that frame the mission. Content lives in
 * src/data/about-page.js.
 */
export function AboutHero() {
  const { hero } = aboutPage;
  const lastLine = hero.titleLines.length - 1;

  return (
    <section className="bg-grid pt-[clamp(2rem,4.2vw,5rem)] pb-[clamp(2rem,4.7vw,6rem)]">
      <Container>
        {/* The entrance here is CSS, not a scroll reveal: this block is already
            painted when React hydrates, so hiding it to animate it back in would
            read as a flash. `animate-fade-up` has `both` fill, so each piece
            starts hidden in the server HTML and arrives on its own delay.

            `motion-reduce:animate-none` drops the animation outright rather than
            leaning on base.css, which only collapses the duration - the delay
            would survive that and hold each piece in its hidden `backwards` fill
            state for up to half a second. */}
        <span
          style={{ animationDelay: "0ms" }}
          className="eyebrow animate-fade-up text-muted-foreground motion-reduce:animate-none"
        >
          {hero.eyebrow}
        </span>

        <div className="mt-5 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
          {/* Left: headline. One step down from the home h1 — this page has a
              long headline and the home page should stay the loudest screen. */}
          <div>
            <h1
              style={{ animationDelay: "50ms" }}
              className="animate-fade-up text-[clamp(2.25rem,1.5rem+3vw,4.25rem)] leading-[1.12] motion-reduce:animate-none"
            >
              {hero.titleLines.map((line, i) => (
                <span key={line} className="block">
                  {line}
                  {i === lastLine && (
                    <>
                      {" "}
                      <span className="text-gradient">{hero.titleHighlight}</span>
                    </>
                  )}
                </span>
              ))}
            </h1>
          </div>

          {/* Right: intro + figures */}
          <div
            style={{ animationDelay: "120ms" }}
            className="animate-fade-up motion-reduce:animate-none lg:mr-[1.7vw] lg:-mb-2 lg:w-[max(25vw,20rem)] lg:max-w-[30rem]"
          >
            <p>{hero.description}</p>

            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {hero.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-heading text-h5 leading-none font-medium tabular-nums">
                      {stat.value}
                    </span>
                    <span className="mt-2 block text-caption text-muted-foreground">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Photo band. Below md the tiles stack and carry their own 16:9 crop;
            from md the row is given a fixed aspect and the tiles stretch to fill
            it, which is what keeps the wide and narrow photos the same height. */}
        <div className="mt-[clamp(2.5rem,5vw,4.5rem)] grid gap-4 md:aspect-[16/5] md:grid-cols-3">
          {hero.images.map((image, i) => (
            <div
              key={image.src}
              style={{ animationDelay: `${180 + i * 80}ms` }}
              className={cn(
                "relative aspect-[16/9] animate-fade-up overflow-hidden rounded-card bg-muted motion-reduce:animate-none md:aspect-auto",
                image.wide && "md:col-span-2",
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={
                  image.wide ? "(max-width: 768px) 92vw, 62vw" : "(max-width: 768px) 92vw, 31vw"
                }
                quality={90}
                priority={image.wide}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
