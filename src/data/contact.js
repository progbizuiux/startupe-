import { siteConfig } from "@/config/site";

/**
 * /contact page content. One key per section component in
 * src/components/sections/contact-*.jsx — nothing here renders JSX, so icons
 * are referenced by key and resolved in the component.
 *
 * The page is two things: the address and a message form. Every number and link
 * is derived from siteConfig.contact rather than written out again, so the
 * footer and this page can never disagree about how to reach the office.
 */

/** wa.me wants the number as digits only — no +, spaces or dashes. */
const waLink = (number) => `https://wa.me/${number.replace(/\D/g, "")}`;

/** tel: tolerates the +, but not the spaces. */
const telLink = (number) => `tel:${number.replace(/[^\d+]/g, "")}`;

const email = siteConfig.contact.email;
const phone = siteConfig.contact.phones[0];
const whatsapp = siteConfig.contact.whatsapp;

/**
 * The enquiry types. Both the form's `topic` select and the zod enum in
 * src/lib/contact-schema.js read this array, so a new topic is added once.
 * Changing a label changes what the CRM receives, so keep them stable.
 */
export const CONTACT_TOPICS = [
  "Help with registering",
  "Partnership or collaboration",
  "Mentoring, E-Clubs and campus sessions",
  "Investor or funding enquiry",
  "Media and press",
  "Something else",
];

/**
 * How the visitor would like to hear back. WhatsApp is only offered while
 * siteConfig.contact.whatsapp is set — see the note on it there.
 */
export const REPLY_CHANNELS = ["Email", "Phone call", ...(whatsapp ? ["WhatsApp"] : [])];

export const contact = {
  /* ---------- Hero: the page's h1, on the same bones as the other pages ---------- */
  hero: {
    eyebrow: "Contact",
    /* Each entry is one line; the highlight is appended to the last line and set
       in the brand gradient, as in src/data/hero.js. */
    titleLines: ["Talk to the people"],
    titleHighlight: "building this",
    description:
      "Send a message and the Startup E+ team will come back to you on whichever channel suits you.",
    /* Deliberately not a response-time commitment: nothing on file supports one,
       and a contact page that prints an SLA the office has not agreed to creates
       the credibility problem it is trying to solve. */
    note: "We read every message. WhatsApp is usually the quickest way to reach us.",
  },

  /* ---------- Form + address: address column on the left, form on the right ---------- */
  form: {
    eyebrow: "Send a message",
    heading: "Write to us",
    description:
      "One message reaches the Startup E+ team. Where a question belongs with a partner institution, we pass it on and tell you that we have.",
    /* Plain text, not a checkbox: both register forms gate on an IP
       acknowledgment because they are taking IP. A message assigns nothing, so
       the same information runs as a line rather than a mandatory tick. */
    privacy:
      "Your details are used to reply to you and are not published or sold. Registration is a separate step, and writing here does not start one.",
    success: {
      heading: "Message sent",
      body: "Thanks for writing. The Startup E+ team will come back to you on the channel you asked for. If it is urgent in the meantime, WhatsApp the office on the number listed here.",
    },
    labels: {
      you: "You",
      message: "Your message",
      fullName: "Full name",
      email: "Email",
      phone: "Phone / WhatsApp",
      phoneHint: "10-digit mobile number",
      topic: "What is this about",
      organisation: "Organisation",
      organisationHint: "College, company or collective, if any",
      preferredReply: "How should we reply",
      messageField: "Your message",
      messageHint: "A sentence or two is enough to get started",
      submit: "Send message",
      submitting: "Sending…",
    },
  },

  /* ---------- The address column, rendering only what is on file ---------- */
  details: {
    eyebrow: "Reach us directly",

    /* One list, one row shape: the address and each direct line all carry a
       channel name above the value. WhatsApp and Phone are the same number, so
       without those names the column reads as a copy-paste mistake.
       `icon` maps to the lucide icon picked in contact-form.jsx; an entry with
       no value is filtered out, so clearing siteConfig.contact.whatsapp removes
       that row rather than leaving a dead one. */
    channels: [
      {
        icon: "address",
        label: "Address",
        /* Read from siteConfig so the footer and this block cannot disagree. */
        lines: siteConfig.contact.address,
        value: siteConfig.contact.address.join(", "),
        href: null,
      },
      {
        icon: "email",
        label: "Email",
        value: email,
        href: `mailto:${email}`,
      },
      {
        icon: "whatsapp",
        label: "WhatsApp",
        value: whatsapp,
        href: whatsapp ? waLink(whatsapp) : null,
        external: true,
      },
      {
        icon: "phone",
        label: "Phone",
        value: phone,
        href: telLink(phone),
      },
    ],

    /* Empty on purpose - there are no confirmed opening hours on file. Fill it
       in and the block appears; leave it and the section renders without it
       rather than printing a guess.
         hours: [{ label: "Monday to Friday", value: "10:00 - 17:00" }] */
    hours: [],
    hoursLabel: "Opening hours",

    followLabel: "Follow the movement",
  },
};
