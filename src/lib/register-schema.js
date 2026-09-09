import { z } from "zod";
import {
  ACADEMIC_STATUSES,
  CURRENT_STAGES,
  ENROLLED_STATUSES,
  FUNDING_HISTORY,
  GENDERS,
  KERALA_DISTRICTS,
  MAX_FOUNDERS,
  OPERATIONAL_HURDLES,
  PITCH_WORD_LIMIT,
  PRIMARY_NEEDS,
  REGISTRATION_TYPES,
  SECTORS,
} from "@/data/register";

/** Words as a human counts them, so the 150-word limit means what applicants expect. */
export const countWords = (value) => (value?.trim() ? value.trim().split(/\s+/).length : 0);

/* 10-digit Indian mobile, tolerant of spaces, dashes and a +91 / 0 prefix */
const WHATSAPP = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;

export const aspirantSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),

    /* an untouched number input arrives as "", which coerces to 0 and would
       report the min-age error; map empty to undefined so it reads correctly */
    age: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce
        .number({ message: "Enter your age" })
        .int("Enter your age in whole years")
        .min(14, "You must be at least 14 to register")
        .max(99, "Enter a valid age"),
    ),

    gender: z.enum(GENDERS, { message: "Select an option" }),
    district: z.enum(KERALA_DISTRICTS, { message: "Select your district" }),

    whatsapp: z.string().trim().regex(WHATSAPP, "Enter a valid 10-digit WhatsApp number"),

    email: z.email("Enter a valid email address"),

    academicStatus: z.enum(ACADEMIC_STATUSES, { message: "Select your current status" }),
    /* only required when the status says they are enrolled - see superRefine */
    institution: z.string().trim().max(160).optional().or(z.literal("")),

    /* the spec allows either a written pitch or a video; the refine below
       enforces "at least one", which no single field constraint can express */
    pitchSummary: z
      .string()
      .trim()
      .refine((v) => countWords(v) <= PITCH_WORD_LIMIT, {
        message: `Keep it to ${PITCH_WORD_LIMIT} words or fewer`,
      })
      .optional()
      .or(z.literal("")),

    pitchVideoUrl: z
      .string()
      .trim()
      .url("Enter a full URL, including https://")
      .optional()
      .or(z.literal("")),

    sector: z.enum(SECTORS, { message: "Select a sector" }),
    primaryNeed: z.enum(PRIMARY_NEEDS, { message: "Select what you need most" }),

    ipAcknowledged: z.literal(true, {
      message: "You must accept the NDA and IP terms to register",
    }),
  })
  .superRefine((data, ctx) => {
    if (ENROLLED_STATUSES.includes(data.academicStatus) && !data.institution) {
      ctx.addIssue({
        code: "custom",
        path: ["institution"],
        message: "Enter the name of your school or college",
      });
    }

    if (!data.pitchSummary && !data.pitchVideoUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["pitchSummary"],
        message: "Add a short written pitch or a video link",
      });
    }
  });

/* ---------------------------------------------------------------------------
   Portal 2 - "The Beginner"
   --------------------------------------------------------------------------- */

/* UDYAM-XX-00-0000000, the format the MSME registry issues */
const UDYAM = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/i;

const founderSchema = z.object({
  name: z.string().trim().min(2, "Enter the founder's name"),
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().regex(WHATSAPP, "Enter a valid 10-digit number"),
  background: z
    .string()
    .trim()
    .min(10, "A line or two on their education or work history")
    .max(600, "Keep it under 600 characters"),
});

export const beginnerSchema = z.object({
  founders: z
    .array(founderSchema)
    .min(1, "Add at least the primary founder")
    .max(MAX_FOUNDERS, `Up to ${MAX_FOUNDERS} founders`),

  legalName: z.string().trim().min(2, "Enter the registered legal name").max(160),
  registrationType: z.enum(REGISTRATION_TYPES, { message: "Select your registration type" }),

  /* optional: many new MSMEs register on Udyam only after incorporating */
  udyamNumber: z
    .string()
    .trim()
    .regex(UDYAM, "Format: UDYAM-KL-00-0000000")
    .optional()
    .or(z.literal("")),

  /* This portal targets 0-2 year old entities, but that is guidance rather than
     a hard gate - an older entity is redirected by a human, not blocked here.
     Only impossible dates are rejected. */
  /* superRefine rather than chained .refine() calls: those all run, so an empty
     field would report "required", "invalid" and "in the future" at once */
  incorporationDate: z.string().superRefine((value, ctx) => {
    const fail = (message) => ctx.addIssue({ code: "custom", message });
    if (!value) return fail("Enter the date of incorporation");
    const ms = Date.parse(value);
    if (Number.isNaN(ms)) return fail("Enter a valid date");
    if (ms > Date.now()) return fail("The date cannot be in the future");
    if (ms < Date.parse("1900-01-01")) return fail("Enter a valid date");
  }),

  currentStage: z.enum(CURRENT_STAGES, { message: "Select your current stage" }),

  /* history, so more than one can apply */
  fundingHistory: z
    .array(z.enum(FUNDING_HISTORY))
    .min(1, "Select at least one source, or Bootstrapped"),

  operationalHurdle: z.enum(OPERATIONAL_HURDLES, { message: "Select your most immediate hurdle" }),

  ipAcknowledged: z.literal(true, {
    message: "You must accept the NDA and IP terms to register",
  }),
});

/** Picks the schema for a portal slug; used by the shared API route. */
export const schemaForPortal = (portal) =>
  ({ aspirant: aspirantSchema, beginner: beginnerSchema })[portal] ?? null;
