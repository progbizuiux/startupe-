import Link from "next/link";
import { aboutPage } from "@/data/about-page";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * The five phases, as a grid of light-grey cards — the same card shape as the
 * "Joining Startup E+" steps (16px radius, muted fill, indigo step label, the
 * numeral as a watermark), laid out in a grid rather than on a timeline because
 * five rails would run the page to twice its height.
 *
 * The sixth cell is the accent tile that says where the five phases lead, so the
 * 3 x 2 grid comes out square on large screens instead of leaving a hole.
 */
export function AboutPhases() {
  const { phases } = aboutPage;

  return (
    <section id="phases" className="section-y">
      <Container>
        <div data-reveal className="max-w-[46rem]">
          <span className="eyebrow text-muted-foreground">{phases.eyebrow}</span>
          <h2 className="mt-4 text-h3">{phases.heading}</h2>
          <p className="mt-5">{phases.description}</p>
        </div>

        {/* cards stagger across the grid as the row arrives */}
        <ol
          data-reveal="stagger"
          role="list"
          className="mt-[clamp(2.5rem,4vw,4rem)] grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {phases.items.map((phase, i) => (
            <li
              key={phase.title}
              className="relative overflow-hidden rounded-[16px] bg-muted p-6 transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-card motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-8"
            >
              {/* the phase number as a watermark, as on the home step cards */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1 right-4 font-heading text-[4.5rem] leading-none font-light text-foreground/[0.06] tabular-nums"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="relative eyebrow text-caption text-indigo">{phase.label}</span>
              <h3 className="relative mt-4 text-h6">{phase.title}</h3>
              <p className="relative mt-4 text-small">{phase.text}</p>
            </li>
          ))}

          {/* Accent tile: the outcome the five phases add up to */}
          <li className="flex flex-col justify-between gap-6 rounded-[16px] bg-indigo p-6 text-background sm:p-8">
            <div>
              <h3 className="text-h6 text-background">{phases.outcome.title}</h3>
              <p className="mt-4 text-small text-background/85">{phases.outcome.text}</p>
            </div>
            <Link
              href={phases.outcome.cta.href}
              className={cn(buttonVariants({ variant: "light", size: "sm" }), "self-start")}
            >
              {phases.outcome.cta.label}
            </Link>
          </li>
        </ol>
      </Container>
    </section>
  );
}
