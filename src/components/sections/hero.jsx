import Image from "next/image";
import Link from "next/link";
import { hero } from "@/data/hero";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroGallery } from "@/components/sections/hero-gallery";

/**
 * Hero (Figma, 1520px frame). Everything is proportional to the viewport so the
 * alignment matches the design at any screen width:
 *   - headline + pill CTA on the left, at the page gutter (5.26vw = 80px at 1520)
 *   - description + avatars on the right, spanning 69% -> 93% of the width,
 *     bottom edge ~28px below the CTA
 *   - photo strip below, edge to edge, 7.2vw under the CTA
 * Content lives in src/data/hero.js.
 */
export function Hero() {
  const lastLine = hero.titleLines.length - 1;

  return (
    <section className="bg-grid pt-[clamp(2.5rem,5.3vw,6.5rem)] pb-[clamp(2rem,4.7vw,6rem)]">
      <Container>
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
          {/* Left: headline + CTA */}
          <div>
            <h1>
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
            <Link href={hero.cta.href} className={cn(buttonVariants({ size: "md" }), "mt-7")}>
              {hero.cta.label}
            </Link>
          </div>

          {/* Right: description + social proof */}
          <div className="lg:mr-[1.7vw] lg:-mb-7 lg:w-[max(23.8vw,18rem)] lg:max-w-[28rem]">
            <p>{hero.description}</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-3">
                {hero.stat.avatars.map((avatar, i) => (
                  <Image
                    key={i}
                    src={avatar.src}
                    alt={avatar.alt}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover ring-2 ring-background"
                  />
                ))}
              </div>
              <p className="text-small leading-tight">
                <span className="block font-medium">{hero.stat.value}</span>
                {hero.stat.label}
              </p>
            </div>
          </div>
        </div>
      </Container>

      <HeroGallery columns={hero.gallery} className="mt-[clamp(3rem,7.2vw,8.75rem)]" />
    </section>
  );
}
