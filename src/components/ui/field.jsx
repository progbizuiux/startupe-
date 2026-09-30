import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared look for text inputs, selects and textareas. */
export const controlClasses =
  "w-full rounded-input border border-border bg-background px-4 py-3 text-body text-foreground " +
  /* A floor equal to the natural height of a text input: 1.744 line-height at
     16px, plus the 12px padding and 1px border on each side. Without it a
     <select> renders 7px shorter than the <input> beside it — Chrome sizes a
     select from its font metrics and ignores line-height — so the two controls
     in a row do not line up. Set here rather than per-form so every control on
     the site is the same height; a textarea is taller than the floor anyway. */
  "min-h-[3.375rem] " +
  "placeholder:text-muted-foreground/70 " +
  /* `ring-inset` matters for alignment: a default ring is drawn outside the
     border box, so a focused control renders 4px taller and wider than the one
     beside it and the row looks misaligned while you are typing in it. Drawn
     inside, the footprint is identical focused or not; the border colour change
     still makes focus obvious. */
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40 focus-visible:outline-none " +
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/25 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/**
 * A <select> in the shared control styling, drawing its own chevron.
 *
 * The native arrow had to go. Chrome paints it in a fixed slot hard against
 * the right border and ignores padding-right entirely — that padding moves the
 * text, not the glyph — so the arrow sat tight to the edge while the text
 * started 16px in, and the control read as lopsided. Firefox and Safari each
 * draw a different glyph in a different spot, so the native one was never
 * consistent anyway.
 *
 * `appearance-none` drops all of it. The icon is `right-4` to mirror the
 * `px-4` on the other side, and `pr-11` keeps a long option from running under
 * it. It is a real element rather than a background-image SVG so the colour
 * stays the muted-foreground token — a data URI cannot read a CSS variable,
 * and would mean writing the hex out for light and dark separately.
 */
export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select className={cn(controlClasses, "appearance-none pr-11", className)} {...props}>
        {children}
      </select>
      {/* pointer-events-none so a click on the chevron still opens the menu. */}
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

/**
 * Label + control + hint/error wrapper.
 *
 * Layout: label -> control -> hint -> error. The hint sits UNDER the control on
 * purpose: above it, a field with a hint would push its own control down and
 * break the alignment with the field beside it in a two-column row (e.g.
 * "WhatsApp number" next to "Email"). Only the single-line label sits above the
 * control, so every control in a row starts on the same line. `min-w-0` keeps a
 * long value from stretching the grid column.
 *
 * `htmlFor`/`id` tie the label to the control, and the hint/error are wired
 * through `aria-describedby` on the caller's side (see how the register form
 * spreads `describedBy`), so screen readers announce the message with the field
 * rather than leaving it as loose text.
 */
export function Field({ id, label, hint, error, required, className, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="text-small font-medium text-foreground">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-destructive">
            *
          </span>
        ) : (
          <span className="ml-2 text-caption text-muted-foreground">Optional</span>
        )}
      </label>

      {children}

      {hint && (
        <p id={hintId} className="text-caption text-muted-foreground">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** ids for aria-describedby, in the order a reader should hear them */
export function describedBy(id, { hint, error }) {
  return (
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") ||
    undefined
  );
}
