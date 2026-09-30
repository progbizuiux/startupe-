import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

/**
 * The confirmation email a registrant gets, with their pass attached.
 *
 * Not to be confused with CRM_NOTIFY_EMAIL, which is the CRM telling the OFFICE
 * a new lead arrived. This is the other direction: the person who just filled
 * the form, told their registration went through, with the registration ID in
 * the body and the PDF attached so they still have it after the tab is closed.
 *
 * Sent through Gmail's own SMTP, signed in as the office account, because the
 * From address is a gmail.com one. It could NOT go through a transactional API
 * like Resend or SendGrid: those require the sending domain to be proved with
 * DNS records, nobody can add DNS records to gmail.com, and mail claiming to be
 * from a Gmail address but sent by a third party fails Gmail's own DMARC checks
 * and is rejected or filed as spam. Sending through Gmail itself, the account
 * really is the sender, so it lands normally.
 *
 * Worth knowing about that choice:
 *  - It needs an App Password, not the account password, and the account must
 *    have 2-step verification on before Google will issue one.
 *  - A free Gmail account will send to roughly 500 recipients a day, a Google
 *    Workspace one about 2000. Past that Google blocks sending for 24 hours.
 *    Fine for registrations at this scale; not fine for a newsletter.
 *  - Every one of these appears in the account's own Sent folder.
 *
 * Swapping providers means rewriting `deliver` below and nothing else -
 * everything above it builds the message, and the route only ever calls
 * sendRegistrationEmail.
 *
 * Server only: reads the credentials from the environment. Never import it into
 * a client component.
 */

const TIMEOUT_MS = 10_000;

/** Read at call time, not module load, so a restart is all it takes to change. */
function config() {
  const user = process.env.MAIL_USER?.trim();

  /* Whitespace stripped, not trimmed. Google shows an App Password as four
     groups of four - "abcd efgh ijkl mnop" - and the spaces are there to make
     it readable, not part of the secret. Pasted straight from that screen the
     value carries them, Gmail rejects the login, and the error you get back is
     a flat EAUTH that says nothing about spaces. Strip them here so it works
     however it was pasted. */
  const pass = process.env.MAIL_APP_PASSWORD?.replace(/\s/g, "");

  /* Both, or nothing. A user without a password is the failure that looks like
     it works: the module would report itself ready and every send would then
     fail authentication, one registration at a time. */
  if (!user || !pass) return null;

  return {
    user,
    pass,
    /* Gmail rewrites From to the authenticated account anyway, so MAIL_FROM is
       only useful for the display name in front of it. */
    from: process.env.MAIL_FROM || `${siteConfig.name} <${user}>`,
    replyTo: process.env.MAIL_REPLY_TO || user,
  };
}

export const isRegistrationEmailConfigured = () => config() !== null;

/**
 * Escape anything that goes into the HTML body.
 *
 * The name is the visitor's own text. The schema restricts it to Latin letters
 * and a few punctuation marks, so nothing dangerous should reach here — but the
 * schema is one edit away from being loosened, and an email body is not the
 * place to find out.
 */
const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Both bodies, built from the same facts.
 *
 * A text part is not optional politeness: a mail with an attachment and no
 * text/plain alternative scores badly with spam filters, and this one has to
 * reach an inbox on the first send to an address that has never heard from us.
 */
/*
 * `pathway` and `portal` are two different things and both belong here.
 * `pathway` is the answer the person gave — "Student", "Entrepreneur",
 * "Business" — and is what the pass prints under "Registration Pathway", so the
 * email has to agree with the document attached to it. `portal` is where they
 * go next, "The Aspirant" or "The Beginner", which is what the button names.
 */
function body({ fullName, registrationId, pathway, portal, nextUrl }) {
  const name = String(fullName ?? "").trim();
  const greeting = name ? `Hi ${name},` : "Hi,";
  const link = `${siteConfig.url}${nextUrl}`;

  const text = [
    greeting,
    "",
    "Your Startup E+ registration has gone through.",
    "",
    `Registration ID: ${registrationId}`,
    `Your pathway: ${pathway}`,
    "",
    "Your pass is attached to this email as a PDF. Keep it: it is issued once.",
    "",
    `The next step is the detailed application, in ${portal}: ${link}`,
    "",
    `If you did not fill this form, you can ignore this email, or tell us at ${siteConfig.contact?.email ?? ""}.`,
    "",
    siteConfig.name,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
    <tr><td>
      <p style="margin:0 0 16px;font-size:16px">${esc(greeting)}</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6">Your Startup E+ registration has gone through.</p>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f4f4f5;border-radius:8px;padding:16px 20px;margin:0 0 24px">
        <tr><td>
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#71717a">Registration ID</p>
          <p style="margin:0 0 16px;font-size:20px;font-weight:600;letter-spacing:.06em">${esc(registrationId)}</p>
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#71717a">Your pathway</p>
          <p style="margin:0;font-size:16px;font-weight:600">${esc(pathway)}</p>
        </td></tr>
      </table>

      <p style="margin:0 0 24px;font-size:16px;line-height:1.6">Your pass is attached as a PDF. Keep it: it is issued once.</p>
      <p style="margin:0 0 28px;font-size:16px;line-height:1.6">The next step is the detailed application, which lives in ${esc(portal)}.</p>
      <p style="margin:0 0 28px"><a href="${esc(link)}" style="display:inline-block;background:#3562f0;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;font-weight:600">Continue to ${esc(portal)}</a></p>

      <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a">If you did not fill this form you can ignore this email, or tell us at ${esc(siteConfig.contact?.email ?? "")}.</p>
    </td></tr>
  </table>
</body></html>`;

  return { text, html };
}

/**
 * The one provider-shaped function. Replace this to move to another provider.
 *
 * A fresh transport per send rather than one held in module scope: this runs
 * from `after()` on a platform that may freeze the process between requests, so
 * a pooled connection would as often as not be a dead socket by the next one.
 * One registration is one connection, opened and closed.
 */
async function deliver(settings, message) {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: settings.user, pass: settings.pass },
    connectionTimeout: TIMEOUT_MS,
    greetingTimeout: TIMEOUT_MS,
    socketTimeout: TIMEOUT_MS,
  });

  try {
    const info = await transport.sendMail(message);
    return { ok: true, id: info.messageId };
  } catch (error) {
    /* Worth naming the two that will actually happen. EAUTH means the App
       Password is wrong, revoked, or 2-step verification was turned off; the
       daily cap comes back as a 550 quota message and is not a code problem. */
    const code = error?.code ?? error?.responseCode;
    const hint =
      code === "EAUTH"
        ? "Gmail rejected the credentials - check MAIL_APP_PASSWORD is a current App Password and 2-step verification is on"
        : /quota|limit/i.test(String(error?.response ?? ""))
          ? "Gmail daily sending limit reached"
          : null;
    return { ok: false, status: code, error: hint ? `${hint}: ${error}` : String(error) };
  } finally {
    transport.close();
  }
}

/**
 * Send one registrant their confirmation and pass.
 *
 * Resolves rather than throws on every failure, including its own timeout, so
 * the caller can log and carry on. This email is a convenience — the person
 * already has the pass from the browser response by the time it is sent — and
 * nothing here may put a completed registration at risk.
 *
 * @param {{ to: string, fullName: string, registrationId: string, pathway: string,
 *           portal: string, nextUrl: string, passBytes: Uint8Array }} registration
 */
export async function sendRegistrationEmail(registration) {
  const settings = config();
  if (!settings) return { ok: false, error: "Registration email is not configured" };

  const { text, html } = body(registration);

  return deliver(settings, {
    from: settings.from,
    to: registration.to,
    replyTo: settings.replyTo,
    subject: `Your Startup E+ registration: ${registration.registrationId}`,
    text,
    html,
    attachments: [
      {
        filename: `startup-e-plus-pass-${registration.registrationId}.pdf`,
        contentType: "application/pdf",
        /* Handed over as raw bytes: nodemailer does the base64 for the MIME
           part itself, so encoding it here would send a base64 string of a
           base64 string and produce an unreadable attachment. The pass is
           ~1.8MB, which is the reason this is sent from `after()` rather than
           inline - Gmail's own limit is 25MB, so size is not the constraint,
           the round trip is. */
        content: Buffer.from(registration.passBytes),
      },
    ],
  });
}
