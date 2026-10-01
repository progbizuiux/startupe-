/**
 * Background scroll lock, for modal dialogs.
 *
 * Two halves, because neither is sufficient alone:
 *
 *  - `lenis.stop()` only silences Lenis's own wheel and touch listeners. Page
 *    Down, Space, the arrow keys and a scrollbar drag all still move the page.
 *    And under `prefers-reduced-motion` smooth-scroll.jsx returns before ever
 *    constructing Lenis, so there is no instance to stop - hence the `?.`.
 *  - `overflow: clip` alone does not stop Lenis, which writes the scroll
 *    position directly rather than going through the scrollbar.
 *
 * An inline style rather than a class: `lenis.destroy()` strips every `lenis*`
 * class off <html>, so a class-driven lock would silently vanish on a hot
 * reload while the modal was open.
 *
 * `lockScroll` is counted so overlapping owners cannot unlock each other's
 * lock. Today there is exactly one, which is precisely when an off-by-one is
 * easiest to introduce and hardest to notice.
 */

/**
 * The single Lenis instance, published by <SmoothScroll /> so the rest of the
 * app can suspend it. Set inside that component's effect and nulled in its
 * cleanup, so StrictMode's destroy-then-recreate leaves it pointing at the
 * live instance rather than a destroyed one.
 */
export const lenisRef = { current: null };

let depth = 0;
let previousOverflow = "";
let previousPaddingRight = "";

export function lockScroll() {
  if (depth++) return;

  const el = document.documentElement;
  /* Measured BEFORE the lock: once overflow is clipped the scrollbar is gone
     and this reads 0, which is the shift we are trying to compensate for. */
  const scrollbar = window.innerWidth - el.clientWidth;

  lenisRef.current?.stop();

  previousOverflow = el.style.overflow;
  previousPaddingRight = el.style.paddingRight;
  el.style.overflow = "clip";
  /* Without this the whole page jumps left by the scrollbar's width the moment
     the modal opens - most visibly the sticky header. */
  if (scrollbar > 0) el.style.paddingRight = `${scrollbar}px`;
}

export function unlockScroll() {
  if (depth === 0 || --depth) return;

  const el = document.documentElement;
  el.style.overflow = previousOverflow;
  el.style.paddingRight = previousPaddingRight;
  /* `start()` routes through Lenis's own reset(), which does not move the
     scroll position - so the page is exactly where it was left. */
  lenisRef.current?.start();
}
