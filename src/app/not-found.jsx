import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <section className="section-y">
      <Container className="text-center">
        <span className="eyebrow">404</span>
        <h1 className="mt-3">Page not found</h1>
        <p className="mx-auto mt-4 max-w-reading lead">
          The page you are looking for does not exist or has moved.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-8" })}>
          Back to home
        </Link>
      </Container>
    </section>
  );
}
