import { z } from "zod";
import { KERALA_DISTRICTS } from "@/data/register";
import { REGISTER_STAGES } from "@/data/register-page";

/**
 * Validation for the /register front door, shared by the form component and
 * the API route so the browser and the server enforce the same rules — the
 * client copy is there for fast feedback, not as the gate.
 *
 * Five fields only. This is a front door: the long questionnaires live in the
 * two portals (src/lib/register-schema.js) and nothing here duplicates them.
 */

/* 10-digit Indian mobile, tolerant of spaces, dashes and a +91 / 0 prefix.
   Copied verbatim from src/lib/register-schema.js, which keeps it module
   private. If you change one, change the other. */
const WHATSAPP = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;

/**
 * The name is printed on a PDF built from the standard PDF fonts, which can
 * only encode Latin-1. Anything outside it would either crash the renderer or,
 * worse, be silently dropped — so "അനു K Nair" would print as "K Nair" on a
 * document carrying that person's identity.
 *
 * So this is a validation failure with a visible message rather than a
 * rendering problem: the person is told before they submit, not after their
 * pass has been issued with half a name on it.
 */
const LATIN_NAME = /^[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ ,.'-]*$/;

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

const STAGE_VALUES = REGISTER_STAGES.map((stage) => stage.value);

export const registerStartSchema = z.object({
  /* Collapse any interior control characters before the length check. `.trim()`
     only strips the ends, and a name carrying a newline would forge an extra
     labelled line in the CRM description and print an extra line on the pass. */
  fullName: z
    .string()
    .transform((value) =>
      String(value ?? "")
        .replace(CONTROL_CHARS, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .pipe(
      z
        .string()
        .min(2, "Enter your full name")
        .max(120)
        .regex(LATIN_NAME, "Enter your name in English letters — it is printed on your pass"),
    ),

  email: z.email("Enter a valid email address"),

  whatsapp: z.string().trim().regex(WHATSAPP, "Enter a valid 10-digit WhatsApp number"),

  district: z.enum(KERALA_DISTRICTS, { message: "Select your district" }),

  stage: z.enum(STAGE_VALUES, { message: "Select where you are now" }),

  /* Honeypot. Unconstrained on purpose: anything this field can reject is a 422
     naming the field, which tells a bot exactly what to stop filling in. The
     route drops a submission carrying it BEFORE validation and answers 201 with
     no ID and no pass, so a bot sees an ordinary success. Never mapped to the
     CRM, and never printed on the pass. */
  website: z.string().optional(),
});

/** The pathway a stage resolves to — used for the pass and the hand-off link. */
export const stageDetails = (value) => REGISTER_STAGES.find((stage) => stage.value === value);
