"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling (Lenis), mounted once for the whole app.
 *
 * Lenis takes over the scroll position, so two things have to be wired up:
 *  - ScrollTrigger is told to update on every Lenis scroll, otherwise the Join
 *    timeline's line fill would lag behind or stop entirely;
 *  - Lenis is driven by GSAP's ticker rather than its own rAF loop, so both run
 *    on one frame callback and can't drift apart. `lagSmoothing(0)` stops GSAP
 *    from swallowing frames after a stall, which would desync the two.
 *
 * Under `prefers-reduced-motion` Lenis is never started, leaving the browser's
 * own instant scrolling in place. (Lenis also honours that setting internally,
 * but not starting it at all keeps the page off the library entirely.)
 *
 * Touch is left on the browser's native scrolling - `syncTouch` routes it
 * through Lenis too, which tends to feel worse than the real thing on iOS.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      /* Smoothing dial. Lenis has two modes and `duration` WINS over `lerp` if
         both are set, so only one is given here.
           lerp     - the position continuously chases the target each frame.
                      Lower = smoother and floatier. Default 0.1.
           duration - each wheel event runs its own fixed-length tween, which
                      reads as a series of glides rather than one flowing motion.
         lerp is the smoother of the two; drop toward 0.05 for more glide, raise
         toward 0.12 for a tighter, more responsive feel. */
      lerp: 0.07,
      /* let in-page links (#faq, #message) still land where they should */
      anchors: {
        offset: -(parseInt(getComputedStyle(document.documentElement).scrollPaddingTop) || 0),
      },
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time) => lenis.raf(time * 1000); // GSAP ticker is in seconds, Lenis wants ms
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* the page grows as images and fonts land, so re-measure both libraries */
    const resize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", resize);

    return () => {
      window.removeEventListener("load", resize);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // back to GSAP's default
      lenis.destroy();
    };
  }, []);

  return null;
}
