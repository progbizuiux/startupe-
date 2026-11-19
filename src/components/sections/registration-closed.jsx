import { registration } from "@/data/register";
import { RegistrationPausedNotice } from "@/components/sections/registration-paused-notice";

/**
 * Stands in for a portal's form while `registration.paused` is true.
 *
 * The CTA buttons on the home page open the same message as a dialog rather
 * than sending anyone here, so this is now the fallback rather than the usual
 * route in: someone following an old link, a bookmark or a search result still
 * lands on an explanation instead of a form that has quietly gone.
 *
 * It takes the form's own place inside PortalLayout rather than replacing the
 * whole page, so the "What you get" column still explains what the portal is
 * for - they learn what they came to learn and know to come back.
 *
 * Styled as the same card the forms show on a successful submit: this is the
 * column saying something rather than asking for input, and both read that way.
 */
export function RegistrationClosed() {
  return (
    <div className="rounded-card border border-border bg-muted p-8">
      <RegistrationPausedNotice notice={registration.notice} />
    </div>
  );
}
