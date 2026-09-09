import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Site logo linking home.
 *
 * The file is the "startupE+" lockup with the "An initiative by Shafi Parambil MP"
 * line, 1200x392 (3.06:1) - width / height below carry that ratio so the browser
 * reserves the right box before it loads. Height follows the --logo-h token
 * (28px mobile -> 41px desktop); width scales with it.
 *
 * The mark is black + blue, so `invert` alone would turn the blue orange in dark
 * mode; `brightness-0 invert` flattens it to solid white instead.
 */
export function Logo({ className, ...props }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} - home`}
      className={cn("inline-flex shrink-0 items-center", className)}
      {...props}
    >
      <Image
        src="/images/startup-logo.webp"
        alt={siteConfig.name}
        width={1200}
        height={392}
        priority
        className="h-logo w-auto dark:brightness-0 dark:invert"
      />
    </Link>
  );
}
