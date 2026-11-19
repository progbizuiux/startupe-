import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * The pause message itself, with no container of its own.
 *
 * Two places show it - the card that stands in for a portal's form, and the
 * dialog the CTA buttons open - and they share this so the two can never end up
 * wording or spacing it differently. Each caller supplies its own box.
 *
 * `headingId` lets the dialog point aria-labelledby at the heading; the card has
 * no use for it and leaves it out.
 */
export function RegistrationPausedNotice({ notice, headingId }) {
  return (
    <>
      <Clock aria-hidden="true" className="size-9 text-lime-ink" />

      {/* pr-12 keeps the heading clear of the dialog's close button, which sits
          in that corner. The card has nothing there and loses nothing by it. */}
      <h2 id={headingId} className="mt-4 pr-12 text-h5">
        {notice.heading}
      </h2>

      {notice.body.map((paragraph) => (
        <p key={paragraph} className="mt-3 text-muted-foreground">
          {paragraph}
        </p>
      ))}

      {/* Ruled off from the explanation above because it answers a different
          question - not "why can't I register" but "is the one I already sent
          still safe", which is the thing a closed form makes people doubt. */}
      <p className="mt-6 border-t border-border pt-6 text-muted-foreground">{notice.submitted}</p>

      <Link
        href={notice.help.href}
        className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-6")}
      >
        {notice.help.label}
      </Link>
    </>
  );
}
