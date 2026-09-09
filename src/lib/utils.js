import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { siteConfig } from "@/config/site";

/**
 * tailwind-merge must know our custom font-size utilities, otherwise
 * cn("text-h1", "text-brand-600") would drop text-h1 (it looks like a color).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["h1", "h2", "h3", "h4", "h5", "h6", "body", "label", "lead", "small", "caption"],
        },
      ],
    },
  },
});

/** Merge class names with Tailwind conflict resolution. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Build an absolute URL for metadata, sitemaps, OG images. */
export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

/** Human-readable date, e.g. "September 8, 2026". */
export function formatDate(input, locale = "en-US") {
  return new Date(input).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
