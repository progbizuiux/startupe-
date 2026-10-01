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
                    {/* An address like startupvadakara@gmail.com has no space to
                        wrap at and is wider than its column, so without this it
                        runs straight out of the column.
                        This used to be max-sm:break-words, on the reasoning that
                        only the phone layout was tight. That was wrong at the top
                        end too: on the lg 12-column grid the Contact column is
                        2/12, which is 137px at a 1100px viewport against a 174px
                        address - it overlapped the Address column beside it.
                        Unscoped is the correct fix rather than a second
                        breakpoint: overflow-wrap only breaks a word that would
                        otherwise overflow, so it does nothing at the widths where
                        the address already fits. */}
                    <Link
                      href={link.href}
                      className="text-small break-words text-background/70 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Group>
          );
        })}

        {/* Address (right-aligned block, ~17vw wide, ends at the content edge) */}
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
        </div>

        {/* Bottom bar: the legal line and the studio credit, across the full
            width, last in the footer at every breakpoint.
            The copyright used to sit inside the Address block above. That block
            is ~245px of the 12-column grid, which broke "...Startup E+. All /
            Rights Reserved" across two lines and made the notice read as a
            fourth line of the address. Down here it has the whole row and fits
            on one line, and it sits next to the other piece of small print. */}
        {/* text-center below sm: the notice needs two lines on a 375px phone,
            and items-center alone only centres the box - the second line would
            still set flush left inside it and look ragged. From sm it is one
            line and justify-between does the placing, so the alignment goes
            back to the start edge. */}
        <div className="col-span-full flex flex-col items-center gap-3 border-t border-background/10 pt-6 text-center text-caption text-background/50 sm:flex-row sm:justify-between sm:text-left">
          <p>
            Copyright © {new Date().getFullYear()} {siteConfig.name}. {footer.copyright}
          </p>
          {footer.credit &&
            (footer.credit.href ? (
              <a
                href={footer.credit.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-background"
              >
                {footer.credit.label}
              </a>
            ) : (
              <p>{footer.credit.label}</p>
            ))}
        </div>
      </Container>
    </footer>
  );
}
