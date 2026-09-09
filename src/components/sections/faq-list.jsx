"use client";

import { useLayoutEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";

/* keep in step with the duration-300 on the answer wrapper below */
const COLLAPSE_MS = 300;

/**
 * The FAQ accordion rows.
 *
 * Markup stays native <details>/<summary>, so with JavaScript off every row
 * still opens and closes and remains keyboard- and screen-reader-accessible.
 * With JavaScript on we take over the toggle to (a) animate the answer open and
 * closed and (b) keep the group exclusive - opening one row closes the other.
 *
 * The height animation is pure CSS: the answer sits in a grid whose single row
 * goes 0fr -> 1fr, which is transitionable in a way `height: auto` is not. That
 * keeps it off the JS main loop entirely - JS only flips `data-state`.
 *
 * `data-state` (not the `open` attribute) drives both the icon and the collapse,
 * because a closing row has to stay `open` until its transition finishes or the
 * browser would hide the content before it could animate.
 *
 * Exclusivity is done here rather than with the native `name` attribute: that
 * groups across the whole document, and React leaves a hidden duplicate of the
 * tree behind while hydrating, so Chrome saw two "open" rows sharing a name and
 * force-closed the visible one.
 */
export function FaqList({ items, defaultOpen = 0 }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const rows = Array.from(el.querySelectorAll("details"));
    const answerOf = (row) => row.querySelector("[data-answer]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* transitionend is the normal way a collapse finishes, but it never fires if
       transitions are off (reduced motion, a print stylesheet, an extension), so
       every close also arms a timer that finishes the job. */
    const timers = new Map();
    const settleClosed = (row) => {
      if (row.dataset.state === "closed") row.open = false;
      timers.delete(row);
    };

    const openRow = (row) => {
      clearTimeout(timers.get(row));
      timers.delete(row);
      row.open = true;
      /* force a style flush between `open` and the state change, otherwise the
         browser coalesces them and the row snaps open with no transition */
      void row.offsetHeight;
      row.dataset.state = "open";
    };

    const closeRow = (row) => {
      row.dataset.state = "closed";
      if (reduced) {
        row.open = false;
        return;
      }
      clearTimeout(timers.get(row));
      timers.set(
        row,
        setTimeout(() => settleClosed(row), COLLAPSE_MS + 50),
      );
    };

    const onToggleClick = (event) => {
      const row = event.currentTarget.parentElement;
      event.preventDefault(); // we own `open` so the collapse can animate
      const isOpen = row.dataset.state === "open";
      rows.forEach((other) => {
        if (other !== row && other.dataset.state === "open") closeRow(other);
      });
      if (isOpen) closeRow(row);
      else openRow(row);
    };

    /* a collapsed row keeps `open` until the transition ends, so remove it here */
    const onTransitionEnd = (event) => {
      if (event.propertyName !== "grid-template-rows") return;
      const row = event.currentTarget.parentElement;
      clearTimeout(timers.get(row));
      settleClosed(row);
    };

    const summaries = rows.map((row) => row.querySelector("summary"));
    const answers = rows.map(answerOf);
    summaries.forEach((s) => s.addEventListener("click", onToggleClick));
    answers.forEach((a) => a.addEventListener("transitionend", onTransitionEnd));

    return () => {
      summaries.forEach((s) => s.removeEventListener("click", onToggleClick));
      answers.forEach((a) => a.removeEventListener("transitionend", onTransitionEnd));
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
    };
  }, []);

  return (
    <div ref={root} className="border-b border-border">
      {items.map((item, i) => {
        const isDefaultOpen = i === defaultOpen;
        return (
          <details
            key={item.question}
            open={isDefaultOpen}
            data-state={isDefaultOpen ? "open" : "closed"}
            className="group border-t border-border"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 [&::-webkit-details-marker]:hidden">
              <h3 className="text-h6">{item.question}</h3>
              <span
                aria-hidden="true"
                className="relative grid size-5 shrink-0 place-items-center text-foreground"
              >
                <Plus
                  className="col-start-1 row-start-1 size-5 transition-all duration-300 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0"
                  strokeWidth={1.5}
                />
                <Minus
                  className="col-start-1 row-start-1 size-5 -rotate-90 opacity-0 transition-all duration-300 group-data-[state=open]:rotate-0 group-data-[state=open]:opacity-100"
                  strokeWidth={1.5}
                />
              </span>
            </summary>
            <div
              data-answer
              className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-data-[state=open]:grid-rows-[1fr] motion-reduce:transition-none"
            >
              <div className="overflow-hidden">
                <p className="max-w-[62ch] pb-7 text-muted-foreground">{item.answer}</p>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
