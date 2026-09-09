"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/* Below this width the timeline rail is dropped for the stacked card layout.
   Keep in sync with Tailwind's `sm` (40rem), which the markup switches on. */
const RAIL = "(min-width: 40rem)";
const STACKED = "(max-width: 39.9375rem)";

/**
 * The numbered step list, with two distinct treatments.
 *
 * From sm (the Figma design): a vertical timeline - big numerals with a line
 * running between them that fills with indigo as the section scrolls past,
 * scrubbed to the scroll position, each numeral / "Step 0N" label lighting up as
 * the fill reaches it.
 *
 * Below sm the rail costs ~40% of a phone's width and a scrubbed line is hard to
 * follow on a small screen, so the steps become plain stacked cards - the number
 * as a watermark, the label as a pill - and the animation changes with them:
 * each card rises into place once, with an indigo bar wiping down its edge, as it
 * enters the viewport.
 *
 * Under `prefers-reduced-motion` neither runs and the list keeps the design's
 * static state: 01 indigo with a short dark tick beneath it.
 */
export function JoinSteps({ steps }) {
  const root = useRef(null);
  const last = steps.length - 1;
  const segments = Math.max(1, last);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    /* ---- from sm: one scrubbed fill running the length of the rail ---- */
    mm.add(`${RAIL} and (prefers-reduced-motion: no-preference)`, () => {
      const fills = gsap.utils.toArray("[data-fill]", el);
      const items = gsap.utils.toArray("li", el);

      /* one tween per connector, laid end to end, so the timeline is `segments` long */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top center",
          end: "bottom center",
          scrub: 0.4,
          onUpdate: (self) => {
            /* a numeral lights up once the fill is most of the way to it */
            const reached = Math.min(last, Math.floor(self.progress * segments + 0.4));
            items.forEach((li, i) => li.setAttribute("data-active", String(i <= reached)));
          },
        },
      });
      fills.forEach((fill, i) => {
        tl.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", duration: 1 }, i);
      });

      return () => tl.kill();
    });

    /* ---- below sm: each card reveals itself once, on entry ---- */
    mm.add(`${STACKED} and (prefers-reduced-motion: no-preference)`, () => {
      const items = gsap.utils.toArray("li", el);

      const timelines = items.map((li) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: li,
            start: "top 85%",
            once: true,
            onEnter: () => li.setAttribute("data-active", "true"),
          },
        });

        tl.from(li.querySelector("[data-card]"), {
          autoAlpha: 0,
          y: 24,
          duration: 0.5,
          ease: "power2.out",
        }).fromTo(
          li.querySelector("[data-bar]"),
          { scaleY: 0 },
          { scaleY: 1, duration: 0.5, ease: "power2.out" },
          "-=0.25",
        );

        return tl;
      });

      /* the reveal only ever plays forwards, so leave the cards visible on exit */
      return () => {
        timelines.forEach((tl) => tl.kill());
        items.forEach((li) => gsap.set(li.querySelector("[data-card]"), { clearProps: "all" }));
      };
    });

    /* the hero images and webfonts land after this effect, changing the page height,
       so re-measure once the first frame is painted and again on full load */
    const refresh = () => ScrollTrigger.refresh();
    const frame = requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [last, segments]);

  return (
    <ol ref={root}>
      {steps.map((step, i) => {
        const number = String(i + 1).padStart(2, "0");
        const isLast = i === last;

        return (
          <li
            key={step.title}
            data-active={i === 0 ? "true" : "false"}
            className="group grid sm:grid-cols-[7rem_1fr] sm:gap-6"
          >
            {/* numeral + line track, from sm only (decorative - the card's
                "Step 0N" label carries the meaning) */}
            <div aria-hidden="true" className="hidden flex-col items-center sm:flex">
              <span className="font-heading text-h1 leading-none font-light tracking-normal text-ink-300 tabular-nums transition-colors duration-500 group-data-[active=true]:text-indigo">
                {number}
              </span>
              {!isLast && (
                <div className="relative mt-2 w-px flex-1 bg-border">
                  <span
                    data-fill
                    className="absolute inset-0 origin-top scale-y-0 bg-indigo motion-reduce:hidden"
                  />
                  {/* reduced motion: the design's static tick under the first numeral */}
                  {i === 0 && (
                    <span className="absolute inset-x-0 top-0 hidden h-8 bg-foreground motion-reduce:block" />
                  )}
                </div>
              )}
            </div>

            {/* the spacing between steps lives on the card so the line reaches the
                next numeral; on phones the cards simply sit closer together */}
            <div
              data-card
              className={cn(
                "relative overflow-hidden rounded-[16px] bg-muted p-6 sm:p-10",
                !isLast && "mb-5 sm:mb-36",
              )}
            >
              {/* phones only: the edge bar that wipes down as the card arrives, and
                  the step number as a watermark now that the rail is gone */}
              <span
                data-bar
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[3px] origin-top bg-indigo sm:hidden"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 right-4 font-heading text-[3.5rem] leading-none font-light text-foreground/10 tabular-nums transition-colors duration-500 group-data-[active=true]:text-indigo/25 sm:hidden"
              >
                {number}
              </span>

              <span className="eyebrow text-caption text-muted-foreground transition-colors duration-500 group-data-[active=true]:text-indigo max-sm:rounded-full max-sm:bg-background max-sm:px-3 max-sm:py-1 max-sm:group-data-[active=true]:bg-indigo max-sm:group-data-[active=true]:text-background">
                {step.label}
              </span>
              <h3 className="mt-6 text-h5">{step.title}</h3>
              <p className="mt-6 text-[clamp(16px,1.2vw,18px)]">{step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
