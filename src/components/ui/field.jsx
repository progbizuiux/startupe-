import { cn } from "@/lib/utils";

/** Shared look for text inputs, selects and textareas. */
export const controlClasses =
  "w-full rounded-input border border-border bg-background px-4 py-3 text-body text-foreground " +
  "placeholder:text-muted-foreground/70 " +
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none " +
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/25 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

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
