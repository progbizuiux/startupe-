# Start-Up — Next.js website starter

Next.js 16 · React 19 · JavaScript · Tailwind CSS v4 · App Router

## Scripts

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the build
npm run lint       # eslint
npm run format     # prettier
```

## Folder structure

```
src/
├── app/                    # routes (App Router)
│   ├── layout.jsx          # root layout: fonts, metadata, providers, header/footer
│   ├── page.jsx            # home page: Hero, About, Partners, Join, Message, Faq, Cta
│   ├── globals.css         # style entry (imports styles/*)
│   ├── not-found.jsx / error.jsx / loading.jsx
│   ├── sitemap.js / robots.js
│   └── api/health/route.js
├── components/
│   ├── ui/                 # primitives: Button, Container, Logo, SocialIcon, ThemeToggle …
│   ├── layout/             # Header, Footer
│   ├── sections/           # page blocks: hero, about, partners, join, message, faq, cta … (one file each)
│   └── providers/          # theme + react-query + toaster
├── styles/
│   ├── tokens.css          # ★ colors, fonts, type scale, spacing, radius, shadows, motion
│   ├── typography.css      # h1–h6 / p / blockquote defaults + .eyebrow / .lead / .text-gradient helpers
│   └── base.css            # reset additions + .container-x / .section-y / .bleed
├── config/site.js          # site name, description, nav, social links
├── lib/                    # fonts.js (next/font), utils.js (cn, absoluteUrl, formatDate)
├── hooks/                  # reusable client hooks
└── data/                   # static content used by sections (hero, about, partners, join, message, faq, cta, footer)
public/
├── images/  icons/  fonts/
```

`@/` maps to `src/` (see `jsconfig.json`), e.g. `import { Button } from "@/components/ui/button"`.

## Typography (from Figma)

Headings use **Inter**, body and labels use **Satoshi**. Text color `#111`.
Desktop sizes below; h1–h4 scale down fluidly on smaller screens.

| Element | Font | Size / Line-height | Weight | Letter-spacing | Utility |
|---|---|---|---|---|---|
| h1 | Inter | 84 / 98 | 500 | -6px | `text-h1` |
| h2 | Inter | 54 / 81 | 600 | -1.62px | `text-h2` |
| h3 | Inter | 48 / 67 | 500 | -1.5px | `text-h3` |
| h4 | Inter | 36 (assumed) | 500 | | `text-h4` |
| h5 | Inter | 28 | 500 | | `text-h5` |
| h6 | Inter | 22 | 500 | | `text-h6` |
| p | Satoshi | 16 / 27.9 | 400 | | `text-body` (color #111 @ 85%) |
| span / label | Satoshi | 14 / 19.11 | 500 | uppercase | `text-label uppercase` or `.eyebrow` |
| blockquote | Satoshi | 18→20 / 1.6 | 400 | | `<blockquote>` (2px gold left rule) |

Plain `<h1>`…`<h6>`, `<p>` and `<blockquote>` tags get these styles automatically (`styles/typography.css`).
Satoshi loads from Fontshare via a `<link>` in `app/layout.jsx`; see `lib/fonts.js` to self-host it.

## Design tokens (edit `src/styles/tokens.css`)

| Token group | Utilities |
|---|---|
| Colors | brand = blue CTA (`bg-primary`, `text-brand-500`; approximated, swap for the Figma hex) · `bg-ink-1000` (#0a0a0a dark bands) · `bg-highlight-pink` `bg-highlight-yellow` (headline boxes) · `text-indigo` `bg-indigo` (steps / Register button) · `bg-background` `text-foreground` `text-muted-foreground` `border-border` `bg-accent` `bg-primary` `text-brand-600` `bg-ink-900` `text-gold-500` `bg-success-soft` |
| Fonts | `font-heading` (Inter) · `font-sans` (Satoshi) · `font-mono` (JetBrains Mono) |
| Type scale | `text-h1` … `text-h6` `text-body` `text-label` `text-lead` `text-small` `text-caption` |
| Widths | `max-w-content` (1920 cap, page scales with the viewport) `max-w-wide` (100%) `max-w-narrow` (1024) `max-w-reading` (672) |
| Spacing | `px-gutter` (side gap 5.26vw: 20px → 101px) `h-header` (52px → 83px) `h-logo` (28px → 41px) `py-section` |
| Shape | `rounded-card` (12px) `rounded-card-lg` (32px) `rounded-button` (pill) `rounded-input` |
| Shadows | `shadow-card` `shadow-elevated` |
| Motion | `ease-out-expo` `animate-fade-up` `animate-fade-in` `animate-marquee` + tw-animate-css |
| Helpers | `.eyebrow` `.lead` `.text-gradient` `.bg-grid` `.container-x` `.section-y` `.bleed` |

Dark mode: `.dark` class on `<html>` via next-themes (`<ThemeToggle />`).
Tailwind `dark:` variant works as usual.

## Installed packages

| Purpose | Package |
|---|---|
| Class merging | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Icons | `lucide-react` |
| Animation | `motion`, `tw-animate-css` |
| Dark mode | `next-themes` |
| Forms + validation | `react-hook-form`, `zod`, `@hookform/resolvers` |
| Data fetching (client) | `@tanstack/react-query` |
| Carousel | `embla-carousel-react`, `embla-carousel-autoplay` |
| Toasts | `sonner` |
| Rich text | `@tailwindcss/typography` (`prose` classes) |
| Formatting | `prettier`, `prettier-plugin-tailwindcss` |

## Adding a page

1. Create `src/app/about/page.jsx`
2. Compose it from `src/components/sections/*` inside `<Container>`
3. Add it to `nav` in `src/config/site.js` (sitemap picks it up automatically)
