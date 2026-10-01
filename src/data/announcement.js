/**
 * The programme modal that greets a visitor when they open the site.
 *
 * Everything the office is likely to want to change lives here. Set
 * `enabled: false` to turn the modal off without touching a component.
 *
 * The wording is deliberately the register page's own (see
 * src/data/register-page.js) rather than new marketing copy: it is the one
 * description of what registering actually gets you that has been checked, and
 * a second version of it here would drift from the page it sends people to.
 * Nothing in this file asserts a fact the site does not already state.
 */
export const announcement = {
  /** Master switch. false renders nothing at all - no client island, no timer. */
  enabled: true,

  eyebrow: "Startup E+",
  /* Split the same way as the page headings: the highlight is appended to the
     last line and picks up the gradient. */
  titleLines: ["Join the movement,"],
  titleHighlight: "get your pass",

  description:
    "A short form, about a minute. You get a Startup E+ registration ID and a pass to download, then a route into the right portal for the detailed application.",

  /** The button the whole modal exists for. */
  action: { label: "Register now", href: "/register" },
  /** The way out, beside the corner close button. */
  dismiss: "Not now",

  /**
   * How long after the page settles before it opens, in ms.
   *
   * Not zero: the home page runs its own entrance animations on load, and a
   * dialog stealing focus mid-way through them reads as a glitch rather than a
   * greeting. Long enough to let the first paint finish, short enough that it
   * still feels like part of arriving.
   */
  delayMs: 900,

  /**
   * Routes that never show it, matched as prefixes.
   *
   * Someone already on a registration page does not need to be interrupted and
   * told to register - the modal would be covering the form it is pointing at.
   */
  excludedPaths: ["/register"],

  /**
   * sessionStorage key marking "this visitor has seen it".
   *
   * sessionStorage, not localStorage: the brief is that it shows when the site
   * is opened, so it should come back on a fresh visit. Per session it appears
   * once and then stays out of the way while the person moves around the site -
   * showing it on every navigation would make the site unusable.
   *
   * Change the key to show it again to everyone who has already dismissed it.
   */
  seenKey: "startup-eplus:programme-modal:v1",
};
