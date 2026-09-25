import { aboutPage } from "@/data/about-page";
import { Container } from "@/components/ui/container";

/**
 * The partner institutions, as a ruled list rather than cards: five rows with a
 * rule above each and below the last, the institution held on the left and what
 * it actually provides on the right. It is the same ruled-block construction as
 * the FAQ, which keeps a long, reference-like list readable and stops the page
 * from running three card grids in a row.
 */
export function AboutStakeholders() {
  const { stakeholders } = aboutPage;

  return (
    <section id="stakeholders" className="section-y">
      <Container>
        <div data-reveal className="max-w-[46rem]">
          <span className="eyebrow text-muted-foreground">{stakeholders.eyebrow}</span>
          <h2 className="mt-4 text-h3">{stakeholders.heading}</h2>
          <p className="mt-5">{stakeholders.description}</p>
        </div>

        {/* the rows come in one after another, which is what makes a long
            reference list feel like it is being laid down rather than dumped */}
        <ul
          data-reveal="stagger"
          role="list"
          className="mt-[clamp(2.5rem,4vw,4rem)] list-none border-b border-border p-0"
        >
          {stakeholders.items.map((item) => (
            <li
              key={item.name}
              className="grid gap-4 border-t border-border py-7 lg:grid-cols-[41.7%_1fr] lg:gap-x-0 lg:py-9"
            >
              <div className="lg:pr-12">
                <h3 className="text-h6">{item.name}</h3>
                <span className="mt-1 block text-small text-muted-foreground">{item.unit}</span>
                {/* brand-700 rather than the brand blue: at 12px on the muted
                    pill the lighter blue only reaches 3.7:1, this reaches 6.4:1 */}
                <span className="mt-3 inline-block rounded-button bg-muted px-3 py-1 text-caption font-medium text-brand-700">
                  {item.role}
                </span>
              </div>
              <p className="max-w-[62ch] text-small">{item.text}</p>
            </li>
          ))}
        </ul>

        <p data-reveal className="mt-8 max-w-[62ch] text-small text-muted-foreground">
          {stakeholders.footnote}
        </p>
      </Container>
    </section>
  );
}
