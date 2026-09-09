import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Pill buttons (Figma). Use `buttonVariants()` on a <Link> for link-buttons:
 *   <Link href="/register" className={buttonVariants({ size: "md" })}>Join</Link>
 */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-button font-medium whitespace-nowrap",
    "transition-colors duration-150 select-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-brand-600",
        light: "bg-background text-foreground hover:bg-ink-100", // on coloured bands
        secondary: "bg-secondary text-secondary-foreground hover:bg-ink-200",
        dark: "bg-foreground text-background hover:bg-ink-800",
        outline: "border border-border bg-transparent hover:bg-muted",
        ghost: "hover:bg-muted",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-10 px-4 text-small",
        md: "h-12 px-6 text-body",
        lg: "h-14 px-8 text-lead",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/**
 * @param {{ variant?: "primary"|"light"|"secondary"|"dark"|"outline"|"ghost"|"link",
 *           size?: "sm"|"md"|"lg"|"icon" }} props
 */
export function Button({ className, variant, size, type = "button", ...props }) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
