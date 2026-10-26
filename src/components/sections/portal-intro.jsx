import { Container } from "@/components/ui/container";

/**
 * Shared shell for a registration portal: the eyebrow / heading / "what you get"
 * column on the left, the portal's form on the right. Both portals use it so
 * they stay visually identical as more are added.
 */
export function PortalLayout({ portal, children }) {
  return (
    <section className="section-y">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[38%_1fr] lg:gap-x-[6%]">
          {/* From lg this column sticks below the header while the form scrolls
              past, so "What you get" stays on screen for the whole of a long
              form — the same treatment the story heading gets on /about and the
              address block on /contact.

              `lg:self-start` is what makes it work, not decoration: a grid item
              stretches to the row height by default, and an item as tall as its
              track has no room left to move against, so the sticky never
              engages. Below lg none of it applies and the block simply sits
              above the form, where sticking would only cover the fields. */}
          <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
            <span className="eyebrow text-muted-foreground">{portal.eyebrow}</span>
            <h1 className="mt-4 text-h3">{portal.heading}</h1>
            <p className="mt-5 text-muted-foreground">{portal.intro}</p>

            <h2 className="mt-10 text-h6">What you get</h2>
            <ul role="list" className="mt-4 flex flex-col gap-3">
              {portal.support.map((item) => (
                <li key={item} className="flex gap-3 text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {children}
        </div>
      </Container>
    </section>
  );
}
