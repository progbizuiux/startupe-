import { contact } from "@/data/contact";
import { Container } from "@/components/ui/container";

/**
 * /contact hero — the page's h1 and the one line under it.
 *
 * Built on the About hero's bones (the faint grid background, the gradient last
 * phrase, the intro held in a narrow column on the right) so the page reads as
 * the same site, but without that hero's tiles: the form and the address are
 * directly below, so there is nothing here worth a jump link.
 *
 * No data-reveal in this section. ScrollReveal skips anything already in the
 * viewport, so it would never fire; the entrance is CSS, as on the other heroes.
 */
export function ContactHero() {
  const { hero } = contact;
  const lastLine = hero.titleLines.length - 1;

  return (
    <section className="bg-grid pt-[clamp(2rem,4.2vw,5rem)] pb-[clamp(2rem,4vw,4.5rem)]">
      <Container>
        {/* `animate-fade-up` carries `both` fill, so each piece starts hidden in
            the server HTML and arrives on its own delay. `motion-reduce:animate-none`
            drops the animation outright rather than leaning on base.css, which
            only collapses the duration — the delay would survive that and hold
            each piece hidden for up to half a second. */}
        <span
          style={{ animationDelay: "0ms" }}
          className="eyebrow animate-fade-up text-muted-foreground motion-reduce:animate-none"
        >
          {hero.eyebrow}
        </span>

        <div className="mt-5 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
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

          {/* Deliberately not a response-time figure — see the note in
              src/data/contact.js. */}
          <div
            style={{ animationDelay: "120ms" }}
            className="animate-fade-up motion-reduce:animate-none lg:mr-[1.7vw] lg:-mb-2 lg:w-[max(25vw,20rem)] lg:max-w-[30rem]"
          >
            <p>{hero.description}</p>
            <p className="mt-6 border-t border-border pt-6 text-small text-muted-foreground">
              {hero.note}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
