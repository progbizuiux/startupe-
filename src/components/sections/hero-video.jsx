"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";

/**
 * One tile of the hero strip, as a silent looping clip instead of a photo.
 *
 * Under `prefers-reduced-motion` this renders the poster and NOTHING ELSE - the
 * <video> is never put in the DOM, so the clip is not even downloaded. Hiding
 * it with CSS would still fetch it, and there is no CSS that stops an autoplay;
 * a decorative loop is exactly the kind of motion that setting is asking us to
 * drop, and it is the one tile on the page that moves on its own.
 *
 * useSyncExternalStore rather than useState + useEffect: matchMedia is an
 * external store, this is what it is for, and it keeps a setState out of an
 * effect body. The server snapshot is `true` (reduced), so the HTML that ships
 * carries the poster image - which is what the browser measures for LCP - and
 * the clip only replaces it after hydration on clients that want motion.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => true;

export function HeroVideo({ src, poster, alt, sizes }) {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (reduced) {
    return (
      <Image src={poster} alt={alt} fill sizes={sizes} quality={90} className="object-cover" />
    );
  }

  return (
    <video
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      /* The clip carries no audio track at all, so there is nothing for a
         browser to refuse to autoplay and nothing for a screen reader to
         announce. aria-hidden because it is decoration: the alt text it would
         otherwise need is already carried by the poster in the reduced branch,
         and a looping street scene tells a screen reader nothing. */
      aria-hidden="true"
      preload="metadata"
      className="size-full object-cover"
    />
  );
}
