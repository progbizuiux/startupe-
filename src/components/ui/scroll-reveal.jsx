"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* One short rise, once, as a block arrives. Deliberately small numbers: the
   point is that the page feels like it settles into place, not that anything
   performs. Anything past ~20px of travel starts to read as a slide. */
const DISTANCE = 18;
const DURATION = 0.7;
const STAGGER = 0.08;
const START = "top 88%";

/* Exactly the properties the tween below writes, and nothing else. `clearProps:
   "all"` is the obvious thing to reach for here and it is wrong: it strips every
   inline style on the element, including ones this component never set — the
   positioning `next/image` writes for `fill`, and the `--ring-angle` that lights
   each card in the dark band. Both are inline styles that belong to somebody
   else. */
const CLEARED = "opacity,visibility,transform";

/**
 * Scroll reveals for a whole page, driven from one client island.
 *
 * Sections stay server components and simply mark what should arrive:
 *   data-reveal            - the element rises as a single block
 *   data-reveal="stagger"  - its direct children rise one after another
 *
 * Mount <ScrollReveal /> once on the page and it wires up every marked block.
 *
 * Two things keep this from being visible as a trick:
 *
 *  - Anything already on screen when the effect runs is left alone. The server
 *    HTML has already painted by the time React hydrates, so hiding those would
 *    be a flash of content disappearing and coming back. Above-the-fold copy
 *    animates with CSS on load instead (see the hero's `animate-fade-up`).
 *  - Each tween clears its own inline styles when it finishes, so nothing is
 *    left holding an `opacity` or a `transform`. A leftover transform would
 *    become a containing block and quietly break the `position: sticky`
 *    heading in the story section.
 *
 * Under `prefers-reduced-motion` nothing is registered at all and the page
 * renders in its final state.
 */
export function ScrollReveal() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tweens = [];
      const animated = [];

      gsap.utils.toArray("[data-reveal]").forEach((block) => {
        /* already in view on load — leave it exactly as the server sent it */
        if (block.getBoundingClientRect().top < window.innerHeight) return;

        const targets = block.dataset.reveal === "stagger" ? Array.from(block.children) : [block];
        animated.push(...targets);

        tweens.push(
          gsap.from(targets, {
            autoAlpha: 0,
            y: DISTANCE,
            duration: DURATION,
            ease: "power2.out",
            stagger: STAGGER,
            onComplete: () => gsap.set(targets, { clearProps: CLEARED }),
            scrollTrigger: { trigger: block, start: START, once: true },
          }),
        );
      });

      return () => {
        tweens.forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
        /* a tween killed mid-flight never reaches onComplete, so make sure
           nothing is left hidden behind an inline opacity. Guarded: a page
           whose blocks were all in view at setup animates nothing, and GSAP
           warns "target not found" if handed an empty list. */
        if (animated.length) gsap.set(animated, { clearProps: CLEARED });
      };
    });

    /* images and webfonts land after this effect and change the page height,
       so re-measure once the first frame is painted and again on full load */
    const refresh = () => ScrollTrigger.refresh();
    const frame = requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, []);

  return null;
}
