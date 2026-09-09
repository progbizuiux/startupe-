import Link from "next/link";
import { siteConfig } from "@/config/site";
import { footer } from "@/data/footer";
import { Container } from "@/components/ui/container";
import { SocialIcon, socialLabel } from "@/components/ui/social-icons";

const headingClass = "font-sans text-small font-medium tracking-normal text-background";

/**
 * Footer (Figma): dark (#111) band with four columns on desktop -
 * description + social icons | Quick Links | Contact | Address + copyright.
 * Columns sit on the 12-col grid at 0 / 42% / 58% / 77% like the design;
 * padding is 44px top / 28px bottom on desktop as measured in Figma.
 * Content lives in src/data/footer.js; social URLs + contact in src/config/site.js.
 */
export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Phones put "Quick Links", "Contact" and "Address" in one row of three,
          with the description spanning it; sm goes to two columns and lg to the
          Figma 12-column row. */}
      <Container className="grid grid-cols-3 gap-x-3 gap-y-10 py-10 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-12 lg:gap-8 lg:pt-11 lg:pb-7">
        {/* Description (optional) + social */}
        <div className="col-span-3 sm:col-span-1 lg:col-span-3">
          {footer.description && <p className="max-w-[20rem] text-small">{footer.description}</p>}
          <ul role="list" className={footer.description ? "mt-7 flex gap-3" : "flex gap-3"}>
            {Object.entries(siteConfig.social).map(([name, href]) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${socialLabel(name)} (opens in a new tab)`}
                  className="flex size-10 items-center justify-center rounded-lg bg-background/10 text-background/80 transition-colors hover:bg-background/20 hover:text-background"
                >
                  <SocialIcon name={name} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Link columns: "Quick Links" is a nav landmark, "Contact" is a plain group */}
        {footer.columns.map((col, i) => {
          const Group = col.nav ? "nav" : "div";
          return (
            <Group
              key={col.title}
              aria-label={col.nav ? col.title : undefined}
              className={i === 0 ? "lg:col-span-2 lg:col-start-6" : "lg:col-span-2 lg:col-start-8"}
            >
              <h2 className={headingClass}>{col.title}</h2>
              <ul role="list" className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {/* Phones only: in the two-column layout an address like
                        startupvadakara@gmail.com is wider than its column and has
                        nowhere to wrap on its own, so it would run off the screen.
                        From sm the columns are wide enough that letting it break
                        would only split the address for no reason. */}
                    <Link
                      href={link.href}
                      className="text-small text-background/70 transition-colors hover:text-background max-sm:break-words"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Group>
          );
        })}

        {/* Address + copyright (right-aligned block, ~17vw wide, ends at the content edge) */}
        <div className="sm:col-span-1 lg:col-span-3 lg:col-start-10 lg:w-[max(17vw,14rem)] lg:justify-self-end">
          <h2 className={headingClass}>{footer.address.title}</h2>
          {/* <address> is the element for contact details; the browser italicises
              it by default, hence not-italic */}
          <address className="mt-5 text-small not-italic">
            {footer.address.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p className="mt-6 text-caption text-background/50 lg:text-right">
            Copyright © {new Date().getFullYear()} {siteConfig.name}. {footer.copyright}
          </p>
        </div>

        {/* Studio credit: its own centred row across the full width, last in the
            footer at every breakpoint */}
        {footer.credit && (
          <p className="col-span-full text-center text-caption text-background/50">
            {footer.credit.href ? (
              <a
                href={footer.credit.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-background"
              >
                {footer.credit.label}
              </a>
            ) : (
              footer.credit.label
            )}
          </p>
        )}
      </Container>
    </footer>
  );
}
