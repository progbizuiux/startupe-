import { z } from "zod";
import { CONTACT_TOPICS, REPLY_CHANNELS } from "@/data/contact";

/**
 * Validation for the /contact form, shared by the form component and the API
 * route so the browser and the server enforce the same rules — the client copy
 * is there for fast feedback, not as the gate.
 *
 * Not derived from src/lib/register-schema.js on purpose. That module is
 * `.superRefine()`-wrapped (so it can no longer be `.extend()`ed) and pulls in
 * fourteen option lists from src/data/register.js, all of which would land in
 * this form's client bundle for the sake of one regex.
 */

/* 10-digit Indian mobile, tolerant of spaces, dashes and a +91 / 0 prefix.
   Copied verbatim from src/lib/register-schema.js rather than imported — see
   the note above. If you change one, change the other. */
const WHATSAPP = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;

/** Reply choices that need a number to reach the visitor on. */
const NEEDS_PHONE = ["Phone call", "WhatsApp"];

export const contactSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),

    email: z.email("Enter a valid email address"),

    /* Optional by default and promoted to required by the superRefine below when
       the visitor asks to be called or messaged. `.or(z.literal(""))` is what
       lets an untouched field through, since defaultValues send "". */
    phone: z
      .string()
      .trim()
      .regex(WHATSAPP, "Enter a valid 10-digit number")
      .optional()
      .or(z.literal("")),

    topic: z.enum(CONTACT_TOPICS, { message: "Select a topic" }),

    organisation: z.string().trim().max(160).optional().or(z.literal("")),

    preferredReply: z.enum(REPLY_CHANNELS, { message: "Select how we should reply" }),

    message: z
      .string()
      .trim()
      .min(20, "Tell us what you need in a sentence or two")
      .max(1200, "Keep it under 1200 characters"),

    /* Honeypot. Unconstrained on purpose: anything this field can reject is a
       422 naming the field, which tells a bot exactly what to stop filling in.
       The route drops a submission carrying it BEFORE validation runs and
       answers 201, so a bot sees an ordinary success. Never mapped to the CRM. */
    website: z.string().optional(),
  })
  /* One object-level refinement rather than chained .refine() calls: those all
     run, so a blank field would report several messages at once. */
  .superRefine((data, ctx) => {
    if (NEEDS_PHONE.includes(data.preferredReply) && !data.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Add a number so we can reach you there",
      });
    }
  });
