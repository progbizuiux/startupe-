"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function ErrorPage({ error, reset }) {
  return (
    <section className="section-y">
      <Container className="text-center">
        <span className="eyebrow">Error</span>
        <h1 className="mt-3">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-reading lead">{error.message}</p>
        <Button className="mt-8" onClick={reset}>
          Try again
        </Button>
      </Container>
    </section>
  );
}
