import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { MobileNav } from "@/components/layout/mobile-nav";

/**
 * Navbar (Figma): logo left, uppercase links centered on the page, pill CTA right.
 * Sizes come from tokens: h-header (52 -> 83px) and the side gap via <Container>.
 * Below md: links + CTA move into <MobileNav />.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <Container className="grid h-header grid-cols-[auto_1fr_auto] items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        <Logo className="col-start-1 justify-self-start" />

        <nav
          aria-label="Main"
          className="col-start-2 hidden items-center justify-center gap-11 md:flex"
        >
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-label uppercase transition-opacity hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 flex items-center gap-3 justify-self-end">
          <Link
            href={siteConfig.cta.href}
            className={cn(buttonVariants({ size: "md" }), "hidden sm:inline-flex")}
          >
            {siteConfig.cta.label}
          </Link>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
