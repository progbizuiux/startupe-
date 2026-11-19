/**
 * "Our sponsors" logo grid on the home page.
 *
 * EMPTY ON PURPOSE. No sponsor has been confirmed in writing yet, and a logo
 * on a public page run out of an MP's office is a claim about who is backing
 * this - not decoration. Plausible-looking placeholders would be a false claim,
 * so the section renders nothing at all until there are real entries here.
 *
 * To add one: drop the file in public/sponsors-logo/ and add a row below.
 *   name - the organisation, exactly as they write it. It is also the alt text,
 *          so it is what a screen reader announces.
 *   src  - path under public/. Square-ish or wide both work: the grid scales
 *          each mark to fit the same box with object-contain, which is what
 *          keeps a tall mark and a wide one looking the same weight.
 *   href - optional. Given one, the card becomes a link to the sponsor; left
 *          out, it is a plain card. Mixing the two in one grid is fine.
 *
 * Any number works - the grid is 2 columns on phones, 3 from sm and 4 from lg,
 * and a part-full last row stays centred rather than hanging to the left.
 */
export const sponsors = {
  eyebrow: "Supported by",
  heading: "Our sponsors",
  description:
    "The organisations backing Startup E+ with funding, facilities and the resources that put these programmes within reach.",

  /** @type {{ name: string, src: string, href?: string }[]} */
  logos: [],
};
