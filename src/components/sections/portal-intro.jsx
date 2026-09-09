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
          <div>
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
