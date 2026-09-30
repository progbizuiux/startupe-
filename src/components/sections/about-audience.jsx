import { Banknote, GraduationCap, LifeBuoy, Rocket, Sprout, TrendingUp } from "lucide-react";
import { aboutPage } from "@/data/about-page";
import { Container } from "@/components/ui/container";

/* Data stays free of JSX, so each entry names its icon and the mapping lives
   here — see `icon` in src/data/about-page.js. */
const ICONS = {
  student: GraduationCap,
  graduate: Rocket,
  maker: Sprout,
  founder: TrendingUp,
  recovery: LifeBuoy,
  investor: Banknote,
};

/**
 * "Who it's for": six white cards on the muted band, each with an indigo-tinted
 * icon tile.
 *
 * Renders on the HOME page, not on About, although it still lives among the
 * about-* files and reads its copy from src/data/about-page.js. The grey band
 * is what keeps it from reading as a repeat of the phase cards directly above
 * it: those are grey cards on white, these are white cards on grey.
 */
export function AboutAudience() {
  const { audience } = aboutPage;

  return (
    <section id="audience" className="bg-muted section-y">
      <Container>
        <div data-reveal className="max-w-[46rem]">
          <span className="eyebrow text-muted-foreground">{audience.eyebrow}</span>
          <h2 className="mt-4 text-h3">{audience.heading}</h2>
          <p className="mt-5">{audience.description}</p>
        </div>

        <ul
          data-reveal="stagger"
          role="list"
          className="mt-[clamp(2.5rem,4vw,4rem)] grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {audience.items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <li
                key={item.title}
                className="rounded-[16px] bg-background p-6 shadow-card transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-elevated motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="inline-grid size-11 place-items-center rounded-card bg-indigo/10 text-indigo"
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-h6">{item.title}</h3>
                <p className="mt-3 text-small">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
