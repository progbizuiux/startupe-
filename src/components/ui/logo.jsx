import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Site logo linking home.
 *
 * The "startup e+" lockup with the "An initiative by Shafi Parambil MP" line,
 * supplied as SVG. The viewBox is cropped to the artwork - the delivered file
 * sits on a 1920x1080 board with the mark in one corner, which would have
 * rendered as a sliver of logo in a lot of empty space. width/height below are
 * the cropped box (4.02:1) so the browser reserves the right space before the
 * file loads.
 *
 * TWO FILES, not one inverted.
 *
 * The old raster logo was flipped for dark mode with `brightness-0 invert`,
 * which flattens everything to a single colour. That worked when the mark was
 * black and blue and the blue was expendable; it does not work now, because it
 * would turn the lime "+" - the one piece of brand colour in the mark - into
 * plain grey. The supplied package has a proper reversed artboard, so dark mode
 * gets that instead and keeps its lime.
 */
export function Logo({ className, ...props }) {
  const shared = { width: 1020, height: 254, priority: true };

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} - home`}
      className={cn("inline-flex shrink-0 items-center", className)}
      {...props}
    >
      {/* Both are rendered and one is hidden, rather than swapped in JS: the
          theme is only known in the browser, and picking in an effect would
          show the wrong mark for a frame on every load. */}
      <Image
        {...shared}
        src="/images/startup-logo.svg"
        alt={siteConfig.name}
        className="h-logo w-auto dark:hidden"
      />
      {/* alt="" because the link already carries the accessible name and the
          mark above names the site: a second copy would read it out twice. */}
      <Image
        {...shared}
        src="/images/startup-logo-dark.svg"
        alt=""
        aria-hidden="true"
        className="hidden h-logo w-auto dark:block"
      />
    </Link>
  );
}
