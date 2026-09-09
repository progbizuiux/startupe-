# sections/

One file per homepage / landing-page block (hero, features, testimonials, cta, …).
Each section:

- is a server component unless it needs interactivity
- wraps its content in `<section className="section-y"><Container>…</Container></section>`
- gets its copy from `src/data/` or props, never hard-coded

Example: `hero.tsx`, `features.tsx`, `testimonials.tsx`, `cta.tsx`
