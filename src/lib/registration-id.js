import { randomInt } from "node:crypto";

/**
 * Registration IDs for the /register front door.
 *
 * Server only — it uses node:crypto. Never import it into a client component.
 *
 * Shape: SEP-XXXXX-XXXXY, where the final character is a check character over
 * everything before it. Two properties matter:
 *
 *  - It is random, not sequential. A sequential number would leak how many
 *    people have registered and let anyone guess their neighbour's ID.
 *  - It is NOT a credential. Nothing is stored, so the site cannot confirm or
 *    refute an ID later; the check character only catches a mistyped or
 *    misread one. The ID's real home is the CRM lead, which is where the
 *    office looks a registration up. The page copy says so plainly, and it
 *    must keep saying so - an ID presented as proof of entitlement would be a
 *    promise this system cannot keep.
 */

/* Crockford-style base32: no I, L, O or U, so nothing reads as 1, 0 or a swear
   word, and a handwritten ID transcribes cleanly. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const BODY_LENGTH = 9; // plus one check character = 10

/** Sum-based check character over the body, in the same alphabet. */
function checkChar(body) {
  let sum = 0;
  for (let i = 0; i < body.length; i += 1) {
    /* position-weighted, so a transposition (SEP-AB vs SEP-BA) changes it */
    sum += ALPHABET.indexOf(body[i]) * (i + 1);
  }
  return ALPHABET[sum % ALPHABET.length];
}

/**
 * A fresh ID, e.g. "SEP-4K7M2-QH93X".
 *
 * `randomInt` is the rejection-sampling CSPRNG helper, not `Math.random()`:
 * these are public-facing identifiers and should not be predictable from one
 * another.
 */
export function createRegistrationId() {
  let body = "";
  for (let i = 0; i < BODY_LENGTH; i += 1) body += ALPHABET[randomInt(ALPHABET.length)];
  const full = body + checkChar(body);
  return `SEP-${full.slice(0, 5)}-${full.slice(5)}`;
}

/**
 * Whether an ID is well-formed and its check character agrees. True only means
 * "this was not mistyped" - it does NOT mean the registration exists, because
 * nothing is stored to check it against.
 */
export function isWellFormedRegistrationId(value) {
  if (typeof value !== "string") return false;
  const match = /^SEP-([0-9A-HJKMNP-TV-Z]{5})-([0-9A-HJKMNP-TV-Z]{5})$/.exec(value.trim());
  if (!match) return false;
  const full = match[1] + match[2];
  return checkChar(full.slice(0, BODY_LENGTH)) === full[BODY_LENGTH];
}
