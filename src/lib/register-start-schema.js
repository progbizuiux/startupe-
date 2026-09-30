import { z } from "zod";
import { KERALA_DISTRICTS } from "@/data/register";
import { OCCUPATIONS } from "@/data/register-page";

/**
 * Validation for the /register front door, shared by the form component and
 * the API route so the browser and the server enforce the same rules — the
 * client copy is there for fast feedback, not as the gate.
 *
 * A front door, not a questionnaire: the long forms live in the two portals
 * (src/lib/register-schema.js) and nothing here duplicates them.
 */

/*
 * 10-digit Indian mobile, checked after separators are stripped.
 *
 * The pattern on its own is NOT tolerant of spaces, whatever the copies of it
 * in register-schema.js and contact-schema.js say in their comments: it allows
 * a space only straight after a +91 prefix, so "98765 43210" — the exact string
 * every one of these forms offers as its placeholder — fails it.
 *
 * Hence normalisePhone, which runs first and leaves the pattern describing only
 * the digits. The other two schemas still have the original and still reject
 * their own placeholder.
 */
const PHONE = /^(?:\+?91|0)?[6-9]\d{9}$/;

/** Drop the separators people actually type, so PHONE sees digits only. */
const normalisePhone = (value) => String(value ?? "").replace(/[\s()-]/g, "");

/**
 * The name is printed on the registration pass, in Geist (see
 * src/lib/register-pass.js). The range stops at U+00FF because that is where
 * Geist stops being complete: between U+00C0 and U+024F it has outlines for
 * only half the code points, with holes at U+0114, U+012C, U+0138, U+014E,
 * U+017F and almost everything above. Latin-1 Supplement it covers without a
 * gap, so a name inside this range always prints.
 *
 * A character outside it is not a crash — an embedded font has no Latin-1
 * limit to hit, and fontkit quietly maps anything missing to glyph 0. That is
 * the reason for the rule, not an argument against it: a silent glyph 0 prints
 * a .notdef box in the middle of someone's name, and "അനു K Nair" would come
 * out as "K Nair" on a document carrying that person's identity.
 *
 * So it is a validation failure with a visible message rather than a rendering
 * problem: the person is told before they submit, not after their pass has
 * been issued with half a name on it.
 */
const NAME_LETTER = "A-Za-zÀ-ÖØ-öø-ÿ";

/* Built from a string so the two halves cannot drift, and so the multiplication
   and division signs sitting inside Latin-1 (U+00D7, U+00F7) stay out of it. */
const LATIN_NAME = new RegExp(`^[${NAME_LETTER}][${NAME_LETTER} ,.'-]*$`);

/*
 * Control characters, zero-width marks and the two Unicode line separators.
 * Built from a string rather than a regex literal on purpose: written as
 * escapes inside a literal, a formatter rewrites   and   into the
 * real characters — and those two ARE line terminators in JavaScript source,
 * so the literal stops parsing. Inside a string the escapes survive.
 */
const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u001F\\u007F-\\u009F\\u200B-\\u200F\\u2028\\u2029]",
  "g",
);

/** Collapse control characters and runs of whitespace before length checks. */
const tidy = (value) =>
  String(value ?? "")
    .replace(CONTROL_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();

const OCCUPATION_VALUES = OCCUPATIONS.map((o) => o.value);

export const registerStartSchema = z.object({
  /* `.trim()` alone only strips the ends, and a name carrying a newline would
     forge an extra labelled line in the CRM description and print an extra line
     on the pass — hence the transform before the length check. */
  fullName: z
    .string()
    .transform(tidy)
    .pipe(
      z
        .string()
        .min(2, "Enter your full name")
        .max(120)
        .regex(LATIN_NAME, "Enter your name in English letters — it is printed on your pass"),
    ),

  /* An untouched number input arrives as "", which would coerce to 0 and report
     the minimum-age error; map empty to undefined so it reads correctly. Same
     treatment as the Aspirant portal's age field. */
  age: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce
      .number({ message: "Enter your age" })
      .int("Enter your age in whole years")
      .min(14, "You must be at least 14 to register")
      .max(99, "Enter a valid age"),
  ),

  occupation: z.enum(OCCUPATION_VALUES, { message: "Select one" }),

  email: z.email("Enter a valid email address"),

  /* preprocess rather than .transform().pipe() so a missing key is caught too:
     it normalises to "" and reports "Enter a valid 10-digit number" instead of
     zod's "expected string, received undefined". The normalised digits are what
     the CRM mapper then receives, which is what it wants anyway. */
  phone: z.preprocess(normalisePhone, z.string().regex(PHONE, "Enter a valid 10-digit number")),

  /* Optional: the fallback number, for when the first one does not answer. The
     `.or(z.literal(""))` branch is what lets an untouched field through, since
     defaultValues send "" and normalisePhone leaves it as "". */
  altPhone: z.preprocess(
    normalisePhone,
    z.string().regex(PHONE, "Enter a valid 10-digit number").or(z.literal("")),
  ),

  address: z
    .string()
    .transform(tidy)
    .pipe(z.string().min(6, "Enter your address").max(240, "Keep it under 240 characters")),

  district: z.enum(KERALA_DISTRICTS, { message: "Select your district" }),

  /* Honeypot. Unconstrained on purpose: anything this field can reject is a 422
     naming the field, which tells a bot exactly what to stop filling in. The
     route drops a submission carrying it BEFORE validation and answers 201 with
     no ID and no pass, so a bot sees an ordinary success. Never mapped to the
     CRM, and never printed on the pass. */
  website: z.string().optional(),
});

/** The portal an occupation resolves to — used for the pass and the hand-off. */
export const occupationDetails = (value) => OCCUPATIONS.find((o) => o.value === value);
