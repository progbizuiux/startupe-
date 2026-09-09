import { cn } from "@/lib/utils";

const sizes = {
  content: "max-w-content",
  wide: "max-w-wide",
  narrow: "max-w-narrow",
  reading: "max-w-reading",
};

/**
 * Centered page column with responsive side padding.
 * @param {{ size?: "content" | "wide" | "narrow" | "reading" }} props — see --layout-* tokens
 */
export function Container({ size = "content", className, ...props }) {
  return <div className={cn("mx-auto w-full px-gutter", sizes[size], className)} {...props} />;
}
