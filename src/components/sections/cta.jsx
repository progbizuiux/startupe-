import Image from "next/image";
import Link from "next/link";
import { cta } from "@/data/cta";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Closing CTA banner (Figma): full-width indigo band. Left: white heading,
 * description and two white pill buttons. Right: a scattered cluster of circular
 * portraits over faint curved lines.
 *
 * That art comes from `cta.background` when one is set - a single wide image
 * sitting behind the whole band from lg, anchored to its right edge so the
 * portraits stay in frame and the copy keeps the empty blue on the left. Phones
 * drop the image entirely and keep the band as flat blue, since a cluster that
 * size is only decoration on a screen that narrow. Without a background image
 * the cluster is composed in code from `cta.avatars`, with the positions/sizes
 * as percentages (see src/data/cta.js) so it scales with the viewport instead of
 * reflowing.
 */
export function Cta() {
  if (cta.background?.src) {
    return (
      /* the art is painted on its own blue, not the brand indigo, so the band
         takes that colour where the image does not reach - otherwise the copy
         area and the image below it are two different blues on phones */
      <section
        id="cta"
        style={cta.background.color ? { backgroundColor: cta.background.color } : undefined}
        className="relative mb-section overflow-hidden bg-indigo py-10 lg:py-0"
      >
        <Container className="relative z-10">
          <div className="text-background lg:flex lg:min-h-[381px] lg:max-w-[46%] lg:flex-col lg:justify-center lg:py-10">
            <h2 className="max-w-[22ch] leading-snug">{cta.heading}</h2>
            <p className="mt-6 max-w-[46ch] text-background/80">{cta.description}</p>
            <div className="mt-7 flex flex-wrap gap-4">
              {cta.buttons.map((button) => (
                <Link
                  key={button.href}
                  href={button.href}
                  className={cn(buttonVariants({ variant: "light", size: "md" }))}
                >
                  {button.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>

        {/* The band's background from lg; phones keep the flat blue on its own.
            A CSS background rather than <Image>: the box is display:none below
            lg, and browsers skip background images on hidden elements, so phones
            never download the art (a hidden lazy <img>, by contrast, is still
            fetched by Chrome). The art is one flat-blue graphic that compresses
            to ~57KB, so losing next/image's resizing costs nothing.

            `contain` keeps the art at the band's full width, so the cluster stays
            on its own half: sized to `cover`, a band made taller by the copy
            wrapping zooms the image in and drags the portraits across the
            heading. The letterboxing that leaves is invisible - the band is
            painted the same blue. */}
        <div
          aria-hidden="true"
          style={{ backgroundImage: `url(${cta.background.src})` }}
          className="hidden bg-contain bg-right bg-no-repeat lg:absolute lg:inset-0 lg:block"
        />
      </section>
    );
  }

  return (
    <section id="cta" className="mb-section overflow-hidden bg-indigo py-10 lg:py-0">
      <Container>
        {/* From lg the cluster sets the band height (Figma: 381px); the copy keeps
            its own padding so it never touches the edges on narrower screens. */}
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          {/* Copy */}
          <div className="text-background lg:py-10">
            <h2 className="max-w-[22ch] leading-snug">{cta.heading}</h2>
            <p className="mt-6 max-w-[46ch] text-background/80">{cta.description}</p>
            <div className="mt-7 flex flex-wrap gap-4">
              {cta.buttons.map((button) => (
                <Link
                  key={button.href}
                  href={button.href}
                  className={cn(buttonVariants({ variant: "light", size: "md" }))}
                >
                  {button.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Avatar cluster */}
          <div className="relative aspect-[534/264] w-full">
            {/* decorative curves behind the photos */}
            <svg
              viewBox="0 0 534 264"
              fill="none"
              aria-hidden="true"
              className="absolute inset-0 size-full text-background/20"
            >
              <path
                d="M394 -30C470 10 508 60 498 104c-10 44-86 44-120 78-34 34-10 96-70 118"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M300 300c-40-52-6-104 40-128 46-24 118-14 160-70"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>

            {cta.avatars.map((avatar) => (
              <span
                key={avatar.src}
                className="absolute block -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-background/10 ring-2 ring-background/30"
                style={{
                  left: `${avatar.x}%`,
                  top: `${avatar.y}%`,
                  width: `${avatar.size}%`,
                  aspectRatio: "1",
                }}
              >
                <Image
                  src={avatar.src}
                  alt={avatar.alt}
                  fill
                  sizes="(max-width: 64rem) 12vw, 8vw"
                  className="object-cover"
                />
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
