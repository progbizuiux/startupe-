"use client";

import { useSyncExternalStore } from "react";

/**
 * Reactive CSS media query, SSR-safe.
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
