import { registerPage } from "@/data/register-page";
import { Container } from "@/components/ui/container";
import { RegisterPassCard } from "@/components/sections/register-pass-card";

/**
 * What you receive, at full size — and the two honest limits.
 *
 * Those limits are stated here, before the form, rather than in the success
 * panel afterwards. "Save it now, it cannot be re-issued" is information
 * someone needs in order to decide, and the same sentence read after the fact
 * is an excuse rather than a warning.
 *
 * Content lives in src/data/register-page.js.
 */
export function RegisterPass() {
  const { pass } = registerPage;

  return (
    <section id="pass" className="bg-muted section-y">
      <Container>
        <div data-reveal className="max-w-[46rem]">
          <span className="eyebrow text-muted-foreground">{pass.eyebrow}</span>
          <h2 className="mt-4 text-h3">{pass.heading}</h2>
          <p className="mt-5">{pass.description}</p>
        </div>

        <div className="mt-[clamp(2.5rem,4vw,4rem)] grid gap-10 lg:grid-cols-[minmax(0,52%)_minmax(0,1fr)] lg:gap-x-[6%]">
          {/* aria-hidden: a picture of the document, not information. Everything
              on it is stated in the list beside it. */}
          <div data-reveal aria-hidden="true">
            <RegisterPassCard />
          </div>

          <div data-reveal>
            <h3 className="text-h6">What is on it</h3>
            <ul role="list" className="mt-4 flex list-none flex-col gap-3 p-0">
              {pass.contains.map((item) => (
                <li key={item} className="flex gap-3 text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-5 border-t border-border pt-8">
              {pass.limits.map((limit) => (
                <div key={limit.title}>
                  <h3 className="text-small font-medium text-foreground">{limit.title}</h3>
                  <p className="mt-2 text-small text-muted-foreground">{limit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
