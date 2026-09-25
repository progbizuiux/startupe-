import { aboutPage } from "@/data/about-page";
import { Container } from "@/components/ui/container";

/**
 * The narrative block: eyebrow + heading held in a column on the left, running
 * copy on the right, closing on a pull quote with the gold rule that the home
 * "message" section uses. The two-column split (41.7% / rest) and the sticky
 * heading are the same shape as the FAQ block, so long-form copy on this page
 * sits in a layout the site already has.
 */
export function AboutStory() {
  const { story } = aboutPage;

  return (
    <section id="story" className="section-y">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[41.7%_1fr] lg:gap-x-0">
          {/* Heading column. It sticks below the header on lg so the heading
              stays with the paragraph being read. */}
          <div
            data-reveal
            className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start lg:pr-12"
          >
            <span className="eyebrow text-muted-foreground">{story.eyebrow}</span>
            <h2 className="mt-4 max-w-[18ch] text-h3">{story.heading}</h2>
          </div>

          <div className="max-w-[62ch]">
            {/* the running copy arrives as one block rather than paragraph by
                paragraph — five separate reveals in a column you are reading
                down is motion you have to wait for */}
            <div data-reveal>
              {story.body.map((paragraph, i) => (
                <p key={i} className={i > 0 ? "mt-6" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* same treatment as the quote in the home "message" section: the
                base blockquote rule is gold, overridden there to solid ink */}
            <blockquote data-reveal className="mt-10 border-l-[3px] border-foreground py-1 pl-6">
              <p className="text-lead text-foreground/85">{story.quote}</p>
            </blockquote>
          </div>
        </div>
      </Container>
    </section>
  );
}
