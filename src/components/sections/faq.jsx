import { faq } from "@/data/faq";
import { Container } from "@/components/ui/container";
import { FaqList } from "@/components/sections/faq-list";

/**
 * FAQ: eyebrow + heading held in a column on the left, the accordion on the
 * right as a stack of rule-separated rows - question on one side, a bare +/-
 * glyph on the other, answer revealed underneath. Rules run above every row and
 * below the last, so the list reads as one ruled block rather than as cards.
 *
 * The rows themselves are a client component (animated open / close, one row at
 * a time) - see faq-list.jsx. Content lives in src/data/faq.js.
 */
export function Faq() {
  return (
    <section id="faq" className="section-y">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[41.7%_1fr] lg:gap-x-0">
          {/* Heading column */}
          <div>
            {faq.eyebrow && <span className="eyebrow text-muted-foreground">{faq.eyebrow}</span>}
            <h2 className="mt-4 max-w-[16ch] text-h3">{faq.heading}</h2>
          </div>

          <FaqList items={faq.items} defaultOpen={faq.defaultOpen} />
        </div>
      </Container>
    </section>
  );
}
