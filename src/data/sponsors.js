/**
 * "Our sponsors" logo grid on the home page.
 *
 * A logo here is a claim about who is backing this, on a page run out of an
 * MP's office - not decoration. Only organisations actually confirmed as
 * sponsors belong in the list, and the section renders nothing at all while it
 * is empty rather than showing a heading over a blank grid.
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

  /* Names are spelled as each organisation writes its own, because this is
     also the alt text - it is what a screen reader reads out in place of the
     mark, so it has to be the name they would recognise.

     No `href` on any of them yet: a wrong link on a sponsor's card is worse
     than no link, and none were supplied. Add the URL to a row and that card
     becomes a link on its own. */
  /** @type {{ name: string, src: string, href?: string }[]} */
  logos: [
    { name: "Ordine Corporate Solutions LLP", src: "/sponsors-logo/ordine.png" },
    { name: "Trade Max Academy", src: "/sponsors-logo/trade-max-academy.png" },
    { name: "BNI Calicut", src: "/sponsors-logo/bni-calicut.png" },
    { name: "The OG Club FM", src: "/sponsors-logo/og-club-fm.png" },
    { name: "Finquo Junior", src: "/sponsors-logo/finquo-junior.png" },
  ],
};
