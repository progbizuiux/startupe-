"use client";

import Link from "next/link";
import { useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { RegistrationPausedNotice } from "@/components/sections/registration-paused-notice";

const HEADING_ID = "registration-paused-heading";

/**
 * The two buttons in the closing CTA band.
 *
 * While registration is paused they stop being links and open the pause message
 * in a dialog instead. Sending someone to a whole page to read two paragraphs,
 * only to have them walk back, is a lot of travel for an answer that fits in a
 * box - and they lose their place on the page on the way.
 *
 * A native <dialog> opened with showModal(), not a div: the browser gives the
 * top layer, the focus trap, Esc to close, the inert background and the return
 * of focus to the button that opened it, all of which a div would have to
 * reimplement and usually gets wrong.
 */
export function CtaButtons({ buttons, paused, notice }) {
  const dialogRef = useRef(null);

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  /* Open as normal: plain links, and none of the dialog ships. */
  if (!paused) {
    return buttons.map((button) => (
      <Link
        key={button.href}
        href={button.href}
        className={cn(buttonVariants({ variant: "dark", size: "md" }))}
      >
        {button.label}
      </Link>
    ));
  }

  return (
    <>
      {buttons.map((button) => (
        <Button key={button.href} variant="dark" size="md" onClick={openDialog}>
          {button.label}
        </Button>
      ))}

      <dialog
        ref={dialogRef}
        aria-labelledby={HEADING_ID}
        /* A click on the backdrop reports the dialog itself as the target - the
           panel below covers every part of the dialog box, so anything that
           reaches the element came from outside it. */
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
        /* m-auto is load-bearing, not styling: a <dialog> centres itself with
           `margin: auto` from the UA stylesheet, and preflight zeroes that, which
           parks the panel in the top-left corner.

           The animations are the ones the rest of the site already uses, and the
           global prefers-reduced-motion rule in base.css turns both off. */
        className={cn(
          "m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto",
          "rounded-card border border-border bg-background p-0 text-foreground shadow-card",
          "animate-fade-up backdrop:animate-fade-in backdrop:bg-ink-950/60",
        )}
      >
        <div className="relative p-8">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            /* size-11 rather than the icon's own size: 44px is the smallest
               comfortable touch target, and the X inside it stays small. */
            className="absolute top-4 right-4 grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X aria-hidden="true" className="size-5" />
          </button>

          <RegistrationPausedNotice notice={notice} headingId={HEADING_ID} />
        </div>
      </dialog>
    </>
  );
}
