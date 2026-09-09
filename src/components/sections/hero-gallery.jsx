import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Photo strip (Figma): 5 bottom-aligned columns of 1-2 rounded photos filling the
 * page width with a 10px edge gap. Column widths are proportional, so the layout
 * scales with the viewport.
 *
 * On phones the five-column strip is unreadable and a swipeable row hides most
 * of it off-screen anyway, so below md a single lead photo is shown full width
 * and the rest are dropped from the layout. Mark the lead with `mobile: true` on
 * a column in src/data/hero.js; otherwise the widest column is used.
 *
 * Each photo carries its Figma aspect ratio in a CSS variable so the desktop
 * ratio can be applied from md up while the phone gets a landscape crop - an
 * inline aspect-ratio would apply at every width.
 */
export function HeroGallery({ columns, className }) {
  const explicit = columns.findIndex((col) => col.mobile);
  const lead =
    explicit >= 0
      ? explicit
      : columns.reduce((best, col, i) => (col.width > columns[best].width ? i : best), 0);

  return (
    <div
      className={cn("px-gutter md:grid md:items-end md:gap-[1vw] md:px-[0.5vw]", className)}
      style={{ gridTemplateColumns: columns.map((col) => `${col.width}fr`).join(" ") }}
    >
      {columns.map((col, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col gap-4 md:gap-[1vw]",
            i === lead ? "w-full" : "hidden md:flex",
          )}
        >
          {col.images.map((img, j) => (
            <div
              key={img.src}
              /* only the lead column renders below md, and only its first photo */
              className={cn(
                "relative overflow-hidden rounded-card bg-muted",
                "aspect-[4/3] md:aspect-[var(--ar)]",
                j > 0 && "hidden md:block",
              )}
              style={{ "--ar": `${col.width}/${img.height}` }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 92vw, 30vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
