"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** Hamburger menu shown below the md breakpoint. Drops a panel under the header. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-b border-border bg-background shadow-card"
        >
          <Container className="flex flex-col py-4">
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={close} className="eyebrow py-3">
                {item.label}
              </Link>
            ))}
            <Link
              href={siteConfig.cta.href}
              onClick={close}
              className={buttonVariants({ className: "mt-3 w-full" })}
            >
              {siteConfig.cta.label}
            </Link>
          </Container>
        </div>
      )}
    </div>
  );
}
