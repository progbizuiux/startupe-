import { KERALA_DISTRICTS, aspirant, beginner } from "@/data/register";
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
/*
 * What each portal says about itself, keyed by the name the success panel
 * already holds. Taken from the portals rather than rewritten here, so the line
 * under "Your next step" is the portal's own description and cannot drift from
 * it.
 */
const PORTAL_INTROS = {
  [aspirant.heading]: aspirant.intro,
  [beginner.heading]: beginner.intro,
};

export function RegisterForm({ preview }) {
  const { form, eyebrow, titleLines, titleHighlight, description } = registerPage;

  return (
    /* `section-y` split into its two halves so the top can be overridden on its
       own. Once the success panel is showing, the page heading above it is gone
       and a full section-space of empty page is left sitting over a card that is
       now the only thing on screen; `has-[[role=status]]` is what notices that,
       since the state lives in the client island below and never reaches here. */
    <section className="pt-[var(--section-space)] pb-[var(--section-space)] has-[[role=status]]:pt-10">
      <Container>
        <div className="mx-auto max-w-[46rem]">
          <RegisterFormFields
            districts={KERALA_DISTRICTS}
            occupations={OCCUPATIONS}
            portals={PORTAL_INTROS}
            labels={form.labels}
            legends={form.legends}
            success={form.success}
            privacy={form.privacy}
            header={{ eyebrow, titleLines, titleHighlight, description }}
            preview={preview}
          />
        </div>
      </Container>
    </section>
  );
}
