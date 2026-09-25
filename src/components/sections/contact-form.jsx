import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { CONTACT_TOPICS, REPLY_CHANNELS, contact } from "@/data/contact";
import { Container } from "@/components/ui/container";
import { SocialIcon, socialLabel } from "@/components/ui/social-icons";
import { ContactFormFields } from "@/components/sections/contact-form-fields";

/* Data stays free of JSX, so each direct line names its icon and the mapping
   lives here — see `icon` in src/data/contact.js. */
const ICONS = { address: MapPin, email: Mail, whatsapp: MessageCircle, phone: Phone };

/**
 * The whole of the contact page below the heading: the address on the left, the
 * message form on the right.
 *
 * The 38% / 1fr split is the registration portals' shell (portal-intro.jsx),
 * inlined rather than imported — PortalLayout hardcodes an h1 and is shaped for
 * a portal, and this page's h1 belongs to the hero. The muted band is doing
 * work: the form's controls are white (see controlClasses in
 * components/ui/field.jsx), so on grey they read as the thing to act on.
 *
 * Opening hours render only if there are any on file; there are none today, so
 * that block is simply absent rather than printing a guess. See src/data/contact.js.
 *
 * This section stays a server component; the fields are a client island, as in
 * faq.jsx / faq-list.jsx. The island takes what it needs as props and never
 * imports from src/data itself.
 */
export function ContactForm() {
  const { form, details } = contact;
  /* a channel with no value (WhatsApp, if the number is ever unset) is dropped
     rather than rendered as a dead row */
  const channels = details.channels.filter((channel) => channel.value);

  return (
    <section id="form" className="bg-muted section-y">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[38%_1fr] lg:gap-x-[6%]">
          {/* ---------- Form ----------
              First in the source on purpose. On a phone the two columns become
              one stack, and with the address above it a visitor who came to
              write a message scrolled roughly 900px of heading and contact
              details before reaching the first input. Source order is also tab
              order, so putting the form first here fixes the reading order as
              well as the visual one — `lg:order-first` on the address below
              returns it to the left column from lg, exactly as the message and
              agency sections do it. */}
          <div>
            <span className="eyebrow text-muted-foreground">{form.eyebrow}</span>
            <h2 className="mt-4 text-h3">{form.heading}</h2>
            <p className="mt-5 max-w-[52ch] text-muted-foreground">{form.description}</p>

            <div className="mt-8">
              <ContactFormFields
                topics={CONTACT_TOPICS}
                channels={REPLY_CHANNELS}
                labels={form.labels}
                success={form.success}
              />
            </div>

            {/* Plain text rather than a checkbox: both registration forms gate on
                an IP acknowledgment because they are taking IP. A message assigns
                nothing, so putting a mandatory tick on the site's lowest-commitment
                interaction would only be friction. */}
            <p className="mt-6 max-w-[62ch] text-caption text-muted-foreground">{form.privacy}</p>
          </div>

          {/* ---------- Address ----------
              `order-first` from lg puts this back in the left column, so the
              desktop layout is unchanged by the source swap above. There it
              also sticks below the header while the form scrolls past, keeping
              the direct lines on screen for the whole of a long form — the same
              treatment the story heading gets on /about. `self-start` is what
              makes that work: a grid item stretches to the row height by
              default, and an item as tall as its track has no room left to move
              against. Below lg none of it applies and the block simply follows
              the form, where a sticky column would only cover the fields. */}
          <div
            data-reveal
            className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:order-first lg:self-start"
          >
            <span className="eyebrow text-muted-foreground">{details.eyebrow}</span>

            {/* <address> is the element for contact details, and it covers the
                phone and email as well as the postal lines; the browser
                italicises it by default, hence not-italic. */}
            <address className="mt-5 not-italic">
              <ul role="list" className="grid list-none gap-1 p-0">
                {channels.map((channel) => {
                  const Icon = ICONS[channel.icon];

                  const body = (
                    <>
                      <span
                        aria-hidden="true"
                        className="inline-grid size-10 shrink-0 place-items-center rounded-card bg-indigo/10 text-indigo transition-colors group-hover:bg-indigo group-hover:text-background"
                      >
                        <Icon className="size-[18px]" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0">
                        <span className="eyebrow block text-caption text-muted-foreground">
                          {channel.label}
                        </span>
                        {channel.lines ? (
                          <span className="mt-1 block text-body font-medium">
                            {channel.lines.join(", ")}
                          </span>
                        ) : (
                          <span className="mt-1 block text-body font-medium break-words">
                            {channel.value}
                          </span>
                        )}
                      </span>
                    </>
                  );

                  /* keyed on href, not label: WhatsApp and Phone are the same
                     number, so the labels collide — and they would collide again
                     on `icon` alone if a second number were ever added to
                     siteConfig.contact.phones. The address row has no href, so
                     it falls back to its label. */
                  return (
                    <li key={channel.href ?? channel.label}>
                      {channel.href ? (
                        <a
                          href={channel.href}
                          {...(channel.external && { target: "_blank", rel: "noreferrer" })}
                          className="group -mx-3 flex items-center gap-4 rounded-card px-3 py-3 transition-colors hover:bg-background"
                        >
                          {body}
                        </a>
                      ) : (
                        /* the address is not a link, so it gets the same row
                           shape without the hover affordance */
                        <div className="group -mx-3 flex items-center gap-4 px-3 py-3">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </address>

            {details.hours.length > 0 && (
              <div className="mt-7 border-t border-border pt-7">
                <span className="eyebrow text-caption text-muted-foreground">
                  {details.hoursLabel}
                </span>
                <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {details.hours.map((entry) => (
                    <div key={entry.label}>
                      <dt className="text-caption text-muted-foreground">{entry.label}</dt>
                      <dd className="mt-1 text-small tabular-nums">{entry.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-7 border-t border-border pt-7">
              <span className="eyebrow text-caption text-muted-foreground">
                {details.followLabel}
              </span>
              <ul role="list" className="mt-4 flex list-none gap-3 p-0">
                {Object.entries(siteConfig.social).map(([name, href]) => (
                  <li key={name}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${socialLabel(name)} (opens in a new tab)`}
                      className="flex size-10 items-center justify-center rounded-lg bg-background text-foreground/70 transition-colors hover:bg-ink-200 hover:text-foreground"
                    >
                      <SocialIcon name={name} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
