import Link from "next/link";
import { join } from "@/data/join";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { JoinSteps } from "@/components/sections/join-steps";

/**
 * "Joining Startup E" (Figma): heading + intro + indigo "Register Now" button on
 * the left; on the right a vertical timeline - big light numerals (01 in indigo,
 * the rest grey) with a thin line running from each numeral to the next, each with
 * a light-grey step card ("STEP 01" label, title, text). The line fills as the
 * section scrolls - see join-steps.jsx. Content lives in src/data/join.js.
 */
export function Join() {
  return (
    <section id="join" className="section-y">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[50.5%_1fr] lg:gap-x-0">
          {/* Intro */}
          <div className="lg:pl-[3.2vw]">
            <h2 className="text-h3">{join.heading}</h2>
            <p className="mt-5 max-w-[40rem]">{join.description}</p>
            <Link
              href={join.cta.href}
              className={cn(buttonVariants({ size: "md" }), "mt-7 bg-indigo hover:bg-indigo/90")}
            >
              {join.cta.label}
            </Link>
          </div>

          {/* Steps timeline (client: scroll-driven line fill) */}
          <JoinSteps steps={join.steps} />
        </div>
      </Container>
    </section>
  );
}
