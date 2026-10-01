"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { announcement } from "@/data/announcement";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * The programme modal shown when someone opens the site.
 *
 * Built on the native <dialog> with showModal(), not a div with
 * role="dialog". That gets the focus trap, Escape, focus return and `inert` on
 * the rest of the document for free - and puts the panel in the top layer,
 * which matters here: this site animates transforms onto scrolled-in blocks
 * (ui/scroll-reveal.jsx), and a transformed ancestor becomes the containing
 * block for anything fixed inside it. The top layer sidesteps that entirely.
 *
 * Copy and behaviour are in src/data/announcement.js.
 */
export function ProgramModal() {
  const pathname = usePathname();
  const dialogRef = useRef(null);
  const headingId = useId();
  const descId = useId();

  const excluded = announcement.excludedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  /**
   * The route it opened on, or null for closed.
   *
   * Storing the route rather than a boolean makes "close on navigation" a
   * derivation instead of an effect: the moment usePathname() reports
   * somewhere else, `open` is false and the dialog unmounts, which runs its
   * cleanup and releases the page's scroll lock. Without that, a browser Back
   * with the dialog up would leave it inert-ing the new page.
   */
  const [openedAt, setOpenedAt] = useState(null);
  const open = openedAt !== null && openedAt === pathname && !excluded;

  /* Decide whether to open, once, after the page has settled.
     setState happens in the timeout callback rather than in the effect body,
     so this does not trip react-hooks/set-state-in-effect - and more to the
     point, it is genuinely deferred rather than a cascading render. */
  useEffect(() => {
    if (!announcement.enabled || excluded) return;

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(announcement.seenKey) === "1";
    } catch {
      /* Private mode and blocked site data both throw on access. Treat it as
         "not seen": the modal is dismissable, so the worst case is that it
         greets someone once per page load instead of once per session. */
    }
    if (seen) return;

    const id = window.setTimeout(() => setOpenedAt(pathname), announcement.delayMs);
    return () => window.clearTimeout(id);
  }, [excluded, pathname]);

  /* Mark as seen as soon as it is shown, not when it is dismissed: someone who
     closes the tab rather than the dialog has still seen it. */
  useEffect(() => {
    if (!open) return;
    try {
      window.sessionStorage.setItem(announcement.seenKey, "1");
    } catch {
      /* see above */
    }
  }, [open]);

  /* Open, and lock the page behind. Both live in one effect so the unlock is
     the effect's cleanup: tie it to a click handler instead and Escape or the
     Android back gesture each leave the page frozen with no modal on screen. */
  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (!el) return;

    /* React does not call showModal() for a <dialog>, and rendering it with an
       `open` attribute gives a NON-modal dialog - no top layer, no backdrop,
       no inert. The guard is for StrictMode's double-invoked effects. */
    if (!el.open) el.showModal();
    lockScroll();
    return unlockScroll;
  }, [open]);

  const close = useCallback(() => {
    const el = dialogRef.current;
    /* close() rather than requestClose(): there is nothing to confirm here, and
       requestClose() is not in Safari before 18.1. Note the common idiom
       `el.requestClose?.() ?? el.close()` is a bug - requestClose() returns
       undefined on success, so `??` falls through and closes twice over. */
    if (el?.open) el.close();
    else setOpenedAt(null);
  }, []);

  if (!announcement.enabled || !open) return null;

  const lastLine = announcement.titleLines.length - 1;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      aria-describedby={descId}
      onClose={() => setOpenedAt(null)}
      /* m-auto is not decoration: the UA centres a modal dialog with
         `margin: auto`, and Tailwind preflight zeroes margin on every element,
         which drops the dialog into the top-left corner. */
      className="m-auto w-[min(34rem,calc(100vw-2rem))] max-w-none rounded-card border border-border bg-background p-0 text-foreground shadow-elevated"
    >
      {/* 12px of travel, matching every other entrance on the site. */}
      <div className="animate-fade-up motion-reduce:animate-none">
        <div className="flex items-start gap-4 p-6 pb-0 sm:p-8 sm:pb-0">
          <span className="mt-1 eyebrow min-w-0 flex-1 text-muted-foreground">
            {announcement.eyebrow}
          </span>
          {/* autoFocus on the close button rather than the dialog: showModal()
              would otherwise focus the first focusable child, which is the
              Register link, and a screen reader would never hear the heading.
              autofocus on the dialog element itself is unreliable in Chrome. */}
          <Button
            autoFocus
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="Close"
            className="-mt-2 -mr-2 shrink-0"
          >
            <X aria-hidden="true" className="size-5" strokeWidth={2} />
          </Button>
        </div>

        <div className="p-6 pt-4 sm:p-8 sm:pt-4">
          <h2 id={headingId} className="text-h4 leading-[1.16]">
            {announcement.titleLines.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i === lastLine && (
                  <>
                    {" "}
                    <span className="text-gradient">{announcement.titleHighlight}</span>
                  </>
                )}
              </span>
            ))}
          </h2>

          <p id={descId} className="mt-4 text-muted-foreground">
            {announcement.description}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={announcement.action.href}
              onClick={close}
              className={cn(buttonVariants({ size: "md" }), "w-full sm:w-auto")}
            >
              {announcement.action.label}
            </Link>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={close}
              className="w-full sm:w-auto"
            >
              {announcement.dismiss}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
