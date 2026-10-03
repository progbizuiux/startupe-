"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CircleCheckBig, Download } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { registerStartSchema } from "@/lib/register-start-schema";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Select, controlClasses, describedBy } from "@/components/ui/field";

/**

/**
 * The registration form, and the hand-off that replaces it on success.
 *
 * Validation lives in src/lib/register-start-schema.js and is shared with the
 * API route, so the browser and the server enforce the same rules; the client
 * copy is there for fast feedback, not as the gate.
 *
 * The pass arrives as base64 in the response rather than from a second
 * endpoint. Nothing is stored, so a "fetch my pass" URL would have to accept
 * the name as a parameter and would happily mint a document for anyone who
 * asked. Inline, the only pass that exists is the one issued to the person who
 * just filled the form.
 */
export function RegisterFormFields({
  districts,
  occupations,
  portals,
  labels,
  legends,
  success,
  privacy,
  header,
  preview,
}) {
  const [result, setResult] = useState(() => {
    /* Dev-only: if the parent passes `preview`, seed the state with mock data
       so the success panel renders immediately without a real submission.
       Activated via ?preview=success on the register page. */
    if (preview) {
      return {
        registrationId: "SEP-K0C6R-S6M4B",
        pathway: "The Aspirant",
        next: "/register/aspirant",
        passUrl: "#",
        fullName: "Preview User",
        district: "Ernakulam",
        occupationLabel: "Student",
      };
    }
    return null;
  });

  /* The panel replaces the form, so the submit button unmounts and focus would
     otherwise fall to <body> while the toast is transient. */
  const doneRef = useRef(null);
  useEffect(() => {
    if (result) {
      doneRef.current?.focus();
      doneRef.current?.scrollIntoView({ block: "center" });
    }
  }, [result]);

  /* The pass is held as an object URL, which pins the whole file in memory
     until it is revoked — and this one is a 1.8MB document. Released when the
     island unmounts; not when `result` changes, because the only change it ever
     makes is null -> set, and revoking then would break the download link. */
  const passUrl = result?.passUrl;
  useEffect(() => () => passUrl && URL.revokeObjectURL(passUrl), [passUrl]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerStartSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      age: "",
      occupation: "",
      email: "",
      phone: "",
      altPhone: "",
      address: "",
      district: "",
      website: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      /* A success answers with the pass itself (application/pdf) and carries the
         registration details in headers; anything that went wrong answers with
         JSON. Branch on the content type rather than on the status alone. */
      const isPass = res.headers.get("content-type")?.startsWith("application/pdf");

      if (!isPass) {
        const payload = await res.json().catch(() => ({}));

        /* The server re-validates, and it is the only side that can reject for
           reasons the browser cannot see. Map its field errors back onto the
           inputs rather than showing one generic failure. */
        if (res.status === 422 && payload.errors) {
          for (const [name, message] of Object.entries(payload.errors)) {
            setError(name, { type: "server", message });
          }
          toast.error("Please check the highlighted fields.");
          return;
        }
        throw new Error(payload.error || `Request failed (${res.status})`);
      }

      /* Hold the file as an object URL so the download button hands over the
         exact bytes the server rendered, with no second request and nothing
         re-encoded. Revoked when the component unmounts. */
      const blob = await res.blob();

      setResult({
        registrationId: res.headers.get("X-Registration-Id"),
        pathway: res.headers.get("X-Registration-Pathway"),
        next: res.headers.get("X-Registration-Next"),
        passUrl: URL.createObjectURL(blob),
        /* from what was just typed: the server has no reason to echo personal
           details back, and these only draw the card on screen */
        fullName: values.fullName,
        district: values.district,
        /* the answer they gave, which is what the pass prints under "Registration
           Pathway"; result.pathway is the PORTAL it routes them to */
        occupationLabel: occupations.find((o) => o.value === values.occupation)?.label,
      });
      toast.success("You're registered. Your pass is ready.");
    } catch (error) {
      toast.error(
        error?.message?.startsWith("Could not")
          ? error.message
          : `Could not complete your registration. Please try again, or email ${siteConfig.contact.email}.`,
      );
    }
  };

  if (result) {
    /* Real copy from the portal itself (src/data/register.js), not a sentence
       written here: the next step should say who that portal is for in the
       portal's own words, so the two cannot drift apart. */
    const portalIntro = portals?.[result.pathway];

    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        /* No width cap. Capping this at 32rem made it TALLER, not smaller: the
           same words in a narrower measure simply run to more lines. Below sm the
           form column is narrower than any cap would be, so nothing here changes
           on a phone. */
        className="animate-success-scale-in overflow-hidden rounded-card border border-border bg-background motion-reduce:animate-none"
      >
        {/* ---------- The moment ---------- */}
        <div className="px-5 pt-6 pb-5 text-center sm:px-10">
          {/* The animation is a CLASS with only the delay inline. Written as an
              inline `animation` shorthand it could not be switched off: an
              inline style beats a stylesheet rule, so `motion-reduce:animate-none`
              never applies, and base.css only collapses the duration — the delay
              survives it and holds each piece invisible, which is the one thing
              somebody asking for reduced motion must not get. */}
          <div
            style={{ animationDelay: "120ms" }}
            className="mx-auto flex size-12 animate-success-ring items-center justify-center rounded-full bg-primary/10 motion-reduce:animate-none"
          >
            <CircleCheckBig aria-hidden="true" className="size-6 text-primary" strokeWidth={2} />
          </div>

          {/* The page's own h1 is hidden once this shows, so this is the h1 and
              the document keeps exactly one. */}
          <h1 className="mt-4 text-h5">{success.heading}</h1>
          <p className="mx-auto mt-2 max-w-[42ch] text-small text-muted-foreground">
            {success.body}
          </p>
        </div>

        {/* ---------- Perforation ---------- */}
        {/* The notches are bg-muted because that is what shows through from the
            stub below; on the page background they would read as two holes
            punched in the wrong colour. */}
        <div className="relative flex items-center" aria-hidden="true">
          <div className="relative -left-2.5 size-5 shrink-0 rounded-full border border-border bg-muted" />
          <div className="flex-1 border-t-2 border-dashed border-border" />
          <div className="relative -right-2.5 size-5 shrink-0 rounded-full border border-border bg-muted" />
        </div>

        {/* ---------- The stub: what they keep ---------- */}
        <div className="bg-muted px-4 pt-5 pb-6 sm:px-10">
          <div className="text-center">
            <span className="eyebrow block text-caption text-muted-foreground">
              {success.idLabel}
            </span>
            {/* `select-all` so one tap takes the whole ID and never half of it:
                this is the string people will be asked to quote. The tracking is
                tighter below sm so fifteen characters still fit a 360px screen
                without wrapping mid-reference. */}
            <span className="mt-1.5 block font-heading text-[clamp(0.875rem,0.5rem+1.5vw,1.5rem)] font-medium tracking-[0.02em] whitespace-nowrap tabular-nums select-all sm:tracking-[0.08em]">
              {result.registrationId}
            </span>
            <p className="mx-auto mt-2 max-w-[38ch] text-caption text-muted-foreground">
              {success.idHint}
            </p>
          </div>

          {/* What was recorded, so it can be checked while the form is still in
              mind rather than found wrong weeks later. Taken from what was
              typed; the server has no reason to echo personal details back.
              Two columns on a phone rather than three - three puts "The
              Beginner" on two lines in a 100px column. */}
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4 text-left sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="eyebrow text-caption text-muted-foreground">{labels.fullName}</dt>
              <dd className="mt-0.5 truncate text-small font-medium">{result.fullName}</dd>
            </div>
            <div className="min-w-0">
              <dt className="eyebrow text-caption text-muted-foreground">{labels.district}</dt>
              <dd className="mt-0.5 truncate text-small font-medium">{result.district}</dd>
            </div>
            <div className="col-span-2 min-w-0 sm:col-span-1">
              <dt className="eyebrow text-caption text-muted-foreground">{success.pathwayLabel}</dt>
              <dd className="mt-0.5 truncate text-small font-medium">
                {result.occupationLabel ?? result.pathway}
              </dd>
            </div>
          </dl>

          {/* The one thing that must not be missed, alone on its row so nothing
              competes with it.

              A plain anchor, not a button with a click handler: `download` on a
              blob URL is what the browser already knows how to do, and it keeps
              working with JavaScript mid-flight or on a middle-click. */}
          <a
            href={result.passUrl}
            download={`startup-e-plus-pass-${result.registrationId}.pdf`}
            className={cn(buttonVariants({ size: "md" }), "mt-5 flex w-full sm:mx-auto sm:w-auto")}
          >
            <Download aria-hidden="true" className="size-4" strokeWidth={2} />
            {success.download}
          </a>
        </div>

        {/* ---------- Where it goes next ---------- */}
        {/* Named AND explained. "Your next step: The Beginner" on its own is a
            portal name that means nothing to someone who has just arrived. */}
        <div className="border-t border-border px-5 py-5 sm:px-10">
          <span className="eyebrow text-caption text-muted-foreground">{success.nextLabel}</span>
          <h2 className="mt-1.5 text-h6">{result.pathway}</h2>
          {portalIntro && (
            <p className="mt-2 max-w-[56ch] text-small text-muted-foreground">{portalIntro}</p>
          )}
          <Link
            href={result.next}
            className={cn(
              buttonVariants({ variant: "outline", size: "md" }),
              "mt-4 flex w-full sm:w-auto",
            )}
          >
            {success.nextCta}
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    );
  }

  const err = (name) => errors[name]?.message;

  return (
    <>
      {header && (
        <div className="mb-[clamp(2rem,3.5vw,3rem)]">
          <span
            style={{ animationDelay: "0ms" }}
            className="eyebrow animate-fade-up text-muted-foreground motion-reduce:animate-none"
          >
            {header.eyebrow}
          </span>

          <h1
            style={{ animationDelay: "50ms" }}
            className="mt-4 animate-fade-up text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] leading-[1.14] motion-reduce:animate-none"
          >
            {header.titleLines.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i === header.titleLines.length - 1 && (
                  <>
                    {" "}
                    <span className="text-gradient">{header.titleHighlight}</span>
                  </>
                )}
              </span>
            ))}
          </h1>

          <p
            style={{ animationDelay: "120ms" }}
            className="mt-5 max-w-[52ch] animate-fade-up text-lead text-muted-foreground motion-reduce:animate-none"
          >
            {header.description}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
        {/* ---------- About you ---------- */}
        <fieldset className="flex flex-col gap-6">
          <legend className="mb-4 eyebrow text-muted-foreground">{legends.you}</legend>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="fullName"
              label={labels.fullName}
              required
              hint={labels.fullNameHint}
              error={err("fullName")}
              className="sm:col-span-2"
            >
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                className={controlClasses}
                aria-invalid={!!err("fullName")}
                aria-describedby={describedBy("fullName", { hint: true, error: err("fullName") })}
                {...register("fullName")}
              />
            </Field>

            <Field id="age" label={labels.age} required error={err("age")}>
              <input
                id="age"
                type="number"
                inputMode="numeric"
                min={14}
                max={99}
                className={controlClasses}
                aria-invalid={!!err("age")}
                aria-describedby={describedBy("age", { error: err("age") })}
                {...register("age")}
              />
            </Field>

            <Field id="occupation" label={labels.occupation} required error={err("occupation")}>
              <Select
                id="occupation"
                aria-invalid={!!err("occupation")}
                aria-describedby={describedBy("occupation", { error: err("occupation") })}
                {...register("occupation")}
              >
                <option value="">Select…</option>
                {occupations.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </fieldset>

        {/* ---------- How to reach you ---------- */}
        <fieldset className="flex flex-col gap-6">
          <legend className="mb-4 eyebrow text-muted-foreground">{legends.reach}</legend>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="email"
              label={labels.email}
              required
              error={err("email")}
              className="sm:col-span-2"
            >
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className={controlClasses}
                aria-invalid={!!err("email")}
                aria-describedby={describedBy("email", { error: err("email") })}
                {...register("email")}
              />
            </Field>

            <Field
              id="phone"
              label={labels.phone}
              required
              hint={labels.phoneHint}
              error={err("phone")}
            >
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                className={controlClasses}
                aria-invalid={!!err("phone")}
                aria-describedby={describedBy("phone", { hint: true, error: err("phone") })}
                {...register("phone")}
              />
            </Field>

            <Field
              id="altPhone"
              label={labels.altPhone}
              hint={labels.altPhoneHint}
              error={err("altPhone")}
            >
              <input
                id="altPhone"
                type="tel"
                inputMode="tel"
                placeholder="98765 43210"
                className={controlClasses}
                aria-invalid={!!err("altPhone")}
                aria-describedby={describedBy("altPhone", { hint: true, error: err("altPhone") })}
                {...register("altPhone")}
              />
            </Field>

            <Field
              id="address"
              label={labels.address}
              required
              hint={labels.addressHint}
              error={err("address")}
              className="sm:col-span-2"
            >
              <textarea
                id="address"
                rows={3}
                autoComplete="street-address"
                className={cn(controlClasses, "resize-y")}
                aria-invalid={!!err("address")}
                aria-describedby={describedBy("address", { hint: true, error: err("address") })}
                {...register("address")}
              />
            </Field>

            <Field id="district" label={labels.district} required error={err("district")}>
              <Select
                id="district"
                aria-invalid={!!err("district")}
                aria-describedby={describedBy("district", { error: err("district") })}
                {...register("district")}
              >
                <option value="">Select…</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </fieldset>

        {/* Honeypot — hidden from assistive tech and out of the tab order, so only
          a bot filling every input will touch it. */}
        <div aria-hidden="true" className="hidden">
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>

        <Button
          type="submit"
          size="md"
          disabled={isSubmitting}
          className="w-full sm:w-auto sm:self-start"
        >
          {isSubmitting ? labels.submitting : labels.submit}
        </Button>

        {privacy && (
          <p className="mt-6 max-w-[62ch] text-caption text-muted-foreground">{privacy}</p>
        )}
      </form>
    </>
  );
}
