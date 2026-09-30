import { KERALA_DISTRICTS } from "@/data/register";
import { OCCUPATIONS, registerPage } from "@/data/register-page";
import { Container } from "@/components/ui/container";
import { RegisterFormFields } from "@/components/sections/register-form-fields";

/**
 * The whole of /register: the page's heading and the eight-field form, which
 * replaces itself with the pass once it is submitted.
 *
 * One section on purpose. An earlier version explained the process across four
 * sections and showed a specimen of the pass before asking for anything; this
 * one puts the form on the first screen instead, and lets the success panel do
 * the explaining at the moment it is useful.
 *
 * A server section wrapping a client island, as in faq.jsx / faq-list.jsx. The
 * island takes the district list and the two pathways as props rather than
 * importing from src/data itself, so the option lists stay server-side and
 * there is one source of truth for them (src/data/register.js for districts,
 * which the schema also builds its enum from).
 */
export function RegisterForm() {
  const { form } = registerPage;
  const lastLine = registerPage.titleLines.length - 1;

  return (
    <section className="section-y">
      <Container>
        <div className="mx-auto max-w-[46rem]">
          {/* The entrance is CSS, not a scroll reveal: this block is already
              painted when React hydrates, so hiding it to animate it back in
              would read as a flash. `motion-reduce:animate-none` drops it
              outright rather than leaning on base.css, which only collapses the
              duration — the delay would survive that and hold each piece hidden
              for up to half a second. */}
          <span
            style={{ animationDelay: "0ms" }}
            className="eyebrow animate-fade-up text-muted-foreground motion-reduce:animate-none"
          >
            {registerPage.eyebrow}
          </span>

          <h1
            style={{ animationDelay: "50ms" }}
            className="mt-4 animate-fade-up text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] leading-[1.14] motion-reduce:animate-none"
          >
            {registerPage.titleLines.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i === lastLine && (
                  <>
                    {" "}
                    <span className="text-gradient">{registerPage.titleHighlight}</span>
                  </>
                )}
              </span>
            ))}
          </h1>

          <p
            style={{ animationDelay: "120ms" }}
            className="mt-5 max-w-[52ch] animate-fade-up text-lead text-muted-foreground motion-reduce:animate-none"
          >
            {registerPage.description}
          </p>

          {/* No entrance animation on the form itself: a tween in flight over a
              control that can take focus is worse than no motion, and the
              success panel changes the block's height anyway. */}
          <div className="mt-[clamp(2rem,3.5vw,3rem)]">
            <RegisterFormFields
              districts={KERALA_DISTRICTS}
              occupations={OCCUPATIONS}
              labels={form.labels}
              legends={form.legends}
              success={form.success}
            />
          </div>

          <p className="mt-6 max-w-[62ch] text-caption text-muted-foreground">{form.privacy}</p>
        </div>
      </Container>
    </section>
  );
}
