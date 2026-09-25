import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The registration pass, drawn in HTML: the same ticket the PDF produces — an
 * information block on the left, a diagonally-cut photograph through the
 * middle, and a panel on the right whose Name and ID rules are filled in.
 *
 * One component, two appearances — the blank specimen shown before anyone
 * registers, and the filled card in the success panel. That is deliberate: as
 * two pieces of markup they would drift, and the page would end up promising
 * something the downloadable file does not deliver. It mirrors the layout in
 * src/lib/register-pass.js, which builds the real thing.
 *
 * The diagonal is a clip-path here and a pair of masking wedges in the PDF —
 * pdf-lib has no clipping. Keep the angles in step if either changes.
 */
const DIM = "text-muted-foreground/40";

/**
 * A filled rule: the label, the value sitting on the line, and the line itself
 * — the reference ticket's blank fields, completed. Declared at module scope
 * rather than inside the card, so it is not a new component type on every
 * render (react-hooks/static-components).
 */
function Field({ label, value, valueClass }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="shrink-0 text-small text-ink-950">{label}</span>
      <span className="min-w-0 flex-1 border-b border-border pb-1">
        <span
          className={cn(
            "block truncate text-small font-bold",
            value ? valueClass : cn(DIM, "font-normal"),
          )}
        >
          {value || " "}
        </span>
      </span>
    </div>
  );
}

export function RegisterPassCard({
  registrationId,
  fullName,
  district,
  pathway,
  issued,
  className,
}) {
  const placeholder = !registrationId;
  const dim = DIM;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-border bg-background shadow-card",
        className,
      )}
    >
      <div className="relative flex min-h-[11.5rem] flex-col sm:flex-row">
        {/* ---------- Left: who issued it, and what for ---------- */}
        <div className="relative z-10 flex flex-col justify-between gap-5 p-5 sm:w-[38%] sm:p-6">
          <div>
            <Image
              src="/images/startup-logo.webp"
              alt={siteConfig.name}
              width={1200}
              height={392}
              className="h-8 w-auto"
            />
            <span className="mt-2 block text-caption text-muted-foreground">
              {siteConfig.contact.address.join(", ")}
            </span>
          </div>

          <div>
            <span
              className={cn(
                "block font-heading text-h6 leading-tight font-bold",
                pathway ? "text-ink-950" : dim,
              )}
            >
              {pathway || "Your pathway"}
            </span>
            <span className="mt-1 block text-caption text-muted-foreground">
              Your registration pathway
            </span>
          </div>

          <div>
            <span className="block text-caption text-muted-foreground">District</span>
            <span
              className={cn(
                "mt-1 block font-heading text-h6 leading-tight font-bold",
                district ? "text-ink-950" : dim,
              )}
            >
              {district || "—"}
            </span>
          </div>
        </div>

        {/* ---------- Middle: the diagonal photo band ----------
            Hidden below sm: at phone width the ticket stacks, and a 60px-wide
            sliver of a photograph is decoration nobody can read. */}
        <div
          aria-hidden="true"
          className="relative hidden w-[30%] shrink-0 sm:block"
          style={{ clipPath: "polygon(28% 0, 100% 0, 72% 100%, 0 100%)" }}
        >
          <Image
            src="/images/pass-photo.jpg"
            alt=""
            fill
            sizes="(min-width: 640px) 30vw, 0px"
            className="object-cover"
          />
        </div>

        {/* ---------- Right: the panel that gets filled in ---------- */}
        <div className="flex flex-1 flex-col justify-between gap-5 border-t border-border p-5 sm:border-t-0 sm:p-6">
          <span className="block text-center font-heading text-h6 font-bold text-ink-950">
            {siteConfig.name}
          </span>

          <div className="flex flex-col gap-4">
            <Field label="Name:" value={fullName} valueClass="text-ink-950" />
            <Field label="ID:" value={registrationId} valueClass="text-brand-600" />
          </div>

          <div className="text-center">
            <span className="block text-caption text-muted-foreground">
              Quote this ID at the Startup E+ office
            </span>
            {issued && (
              <span className="mt-1 block text-caption text-muted-foreground">Issued {issued}</span>
            )}
            <span className="mt-1 block text-caption text-muted-foreground/70">
              Not proof of enrolment or selection
            </span>
          </div>
        </div>
      </div>

      {placeholder && <span className="sr-only">Example pass. Register to receive your own.</span>}
    </div>
  );
}
