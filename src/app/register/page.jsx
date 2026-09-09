import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { portals } from "@/data/register";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Register",
  description: "Choose the Startup E pathway that matches where you are.",
};

/** Portal chooser. Each portal has its own route, form and validation schema. */
export default function RegisterPage() {
  return (
    <section className="section-y">
      <Container>
        <span className="eyebrow text-muted-foreground">Register</span>
        <h1 className="mt-4 max-w-[18ch] text-h3">Choose the pathway that fits you</h1>

        <ul role="list" className="mt-12 grid gap-6 md:grid-cols-2">
          {portals.map((portal) => (
            <li key={portal.slug}>
              <Link
                href={`/register/${portal.slug}`}
                className="group flex h-full flex-col rounded-card border border-border p-8 transition-colors hover:bg-muted"
              >
                <span className="eyebrow text-muted-foreground">{portal.eyebrow}</span>
                <h2 className="mt-3 text-h5">{portal.heading}</h2>
                <p className="mt-3 text-muted-foreground">{portal.blurb}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-small font-medium text-indigo">
                  Start registration
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
