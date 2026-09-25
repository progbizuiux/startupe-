import Link from "next/link";
import { registerPage } from "@/data/register-page";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RegisterPassCard } from "@/components/sections/register-pass-card";

/**
 * /register hero, on the same bones as the other pages' heroes (the faint grid,
 * the gradient last phrase, the intro in a narrow column) — with the pass
 * specimen beside it, so the thing being offered is on screen before anything
 * is asked for.
 *
 * The specimen is the same component that renders the filled card after
 * submitting, so the promise and the delivery cannot drift apart.
 *
 * No data-reveal here: ScrollReveal skips anything already in the viewport, so
 * it would never fire. The entrance is CSS, as on the other heroes.
 */
export function RegisterHero() {
  const { hero } = registerPage;
  const lastLine = hero.titleLines.length - 1;

  return (
    <section className="bg-grid pt-[clamp(2rem,4.2vw,5rem)] pb-[clamp(2.5rem,4.5vw,5rem)]">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,46%)] lg:gap-x-[6%]">
          <div>
            {/* `animate-fade-up` carries `both` fill, so each piece starts hidden
                in the server HTML and arrives on its own delay.
                `motion-reduce:animate-none` drops it outright rather than leaning
                on base.css, which only collapses the duration — the delay would
                survive that and hold each piece hidden for up to half a second. */}
            <span
              style={{ animationDelay: "0ms" }}
              className="eyebrow animate-fade-up text-muted-foreground motion-reduce:animate-none"
            >
              {hero.eyebrow}
            </span>

            <h1
              style={{ animationDelay: "50ms" }}
              className="mt-5 animate-fade-up text-[clamp(2.25rem,1.5rem+3vw,4.25rem)] leading-[1.12] motion-reduce:animate-none"
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

            <p
              style={{ animationDelay: "120ms" }}
              className="mt-6 max-w-[52ch] animate-fade-up motion-reduce:animate-none"
            >
              {hero.description}
            </p>

            <div
              style={{ animationDelay: "180ms" }}
              className="mt-8 flex animate-fade-up flex-wrap gap-4 motion-reduce:animate-none"
            >
              {hero.buttons.map((button) => (
                <Link
                  key={button.href}
                  href={button.href}
                  className={cn(buttonVariants({ variant: button.variant, size: "md" }))}
                >
                  {button.label}
                </Link>
              ))}
            </div>
          </div>

          {/* The specimen. aria-hidden because it is a picture of the document,
              not information — every fact on it is stated in the copy, and a
              screen reader announcing "Your name / SEP-XXXXX-XXXXX" would only
              be confusing. */}
          <div
            aria-hidden="true"
            style={{ animationDelay: "240ms" }}
            className="animate-fade-up motion-reduce:animate-none"
          >
            <RegisterPassCard />
          </div>
        </div>
      </Container>
    </section>
  );
}
