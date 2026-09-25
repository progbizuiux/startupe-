import { registerPage } from "@/data/register-page";
import { Container } from "@/components/ui/container";

/**
 * The four steps, placed before the form rather than after it: the user asked
 * for a section that explains the process, and an explanation below the form is
 * one that whoever submits never reads.
 *
 * Built on the card grid the About page's phases use, not the scroll-driven
 * timeline in join-steps.jsx — that one earns its rail on a long landing page,
 * whereas here the form is a few hundred pixels below and a scrubbed animation
 * would just delay someone who came to register.
 *
 * Content lives in src/data/register-page.js.
 */
export function RegisterSteps() {
  const { steps } = registerPage;

  return (
    <section id="steps" className="section-y">
      <Container>
        <div data-reveal className="max-w-[46rem]">
          <span className="eyebrow text-muted-foreground">{steps.eyebrow}</span>
          <h2 className="mt-4 text-h3">{steps.heading}</h2>
          <p className="mt-5">{steps.description}</p>
        </div>

        <ol
          data-reveal="stagger"
          role="list"
          className="mt-[clamp(2.5rem,4vw,4rem)] grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.items.map((step, i) => (
            <li
              key={step.title}
              className="relative overflow-hidden rounded-[16px] bg-muted p-6 transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-card motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-8"
            >
              {/* the step number as a watermark, as on the home and About cards */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1 right-4 font-heading text-[4.5rem] leading-none font-light text-foreground/[0.06] tabular-nums"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="relative eyebrow text-caption text-indigo">{step.label}</span>
              <h3 className="relative mt-4 text-h6">{step.title}</h3>
              <p className="relative mt-4 text-small">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
