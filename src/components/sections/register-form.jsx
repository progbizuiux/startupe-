import { KERALA_DISTRICTS } from "@/data/register";
import { REGISTER_STAGES, registerPage } from "@/data/register-page";
import { Container } from "@/components/ui/container";
import { RegisterFormFields } from "@/components/sections/register-form-fields";

/**
 * The form, and — on success — the hand-off that replaces it.
 *
 * A server section wrapping a client island, as in faq.jsx / faq-list.jsx. The
 * island takes the district list and the two pathways as props rather than
 * importing from src/data itself, so the option lists stay server-side and
 * there is one source of truth for them (src/data/register.js for districts,
 * which the schema also builds its enum from).
 *
 * Content lives in src/data/register-page.js.
 */
export function RegisterForm() {
  const { form } = registerPage;

  return (
    <section id="form" className="section-y">
      <Container>
        <div className="mx-auto max-w-[48rem]">
          <div data-reveal>
            <span className="eyebrow text-muted-foreground">{form.eyebrow}</span>
            <h2 className="mt-4 text-h3">{form.heading}</h2>
            <p className="mt-5 max-w-[52ch] text-muted-foreground">{form.description}</p>
          </div>

          {/* No data-reveal on the form block: a tween in flight over a control
              that can take focus is worse than no motion, and the success panel
              changes the block's height anyway. */}
          <div className="mt-[clamp(2rem,3vw,3rem)]">
            <RegisterFormFields
              districts={KERALA_DISTRICTS}
              stages={REGISTER_STAGES}
              labels={form.labels}
              stageLabel={form.stageLabel}
              stageHint={form.stageHint}
              success={form.success}
            />
          </div>

          <p className="mt-6 max-w-[62ch] text-caption text-muted-foreground">{form.privacy}</p>
        </div>
      </Container>
    </section>
  );
}
