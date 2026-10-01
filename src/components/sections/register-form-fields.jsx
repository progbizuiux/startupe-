"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Download } from "lucide-react";
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
export function RegisterFormFields({ districts, occupations, labels, legends, success, privacy, header, preview }) {
  const [result, setResult] = useState(() => {
    /* Dev-only: if the parent passes `preview`, seed the state with mock data
       so the success panel renders immediately without a real submission.
       Activated via ?preview=success on the register page. */
    if (preview) {
      return {
        registrationId: "SE-2026-XXXX",
        pathway: "The Aspirant",
        next: "/register/aspirant",
        passUrl: "#",
        fullName: "Preview User",
        district: "Ernakulam",
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
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className="relative overflow-hidden rounded-[1.5rem] bg-white border border-ink-200 text-ink-950 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] motion-reduce:animate-none"
        style={{ animation: "success-scale-in 600ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        <h1 className="sr-only">Registration Successful</h1>
        {/* Top ambient soft green glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-emerald-50/70 to-transparent" aria-hidden="true" />

        {/* Top section — checkmark + heading */}
        <div className="relative px-8 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10 text-center">
          {/* Animated success icon */}
          <div
            className="relative mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60 border border-emerald-200/80 motion-reduce:animate-none"
            style={{ animation: "success-ring 500ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-8 text-emerald-600 motion-reduce:animate-none"
              aria-hidden="true"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth={2.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 24,
                  strokeDashoffset: 0,
                  animation: "success-check 400ms cubic-bezier(0.16, 1, 0.3, 1) 400ms both",
                }}
              />
            </svg>
          </div>

          {/* Heading - Green text */}
          <h2
            className="font-heading text-h3 font-bold text-emerald-600 motion-reduce:animate-none"
            style={{ animation: "success-scale-in 500ms cubic-bezier(0.16, 1, 0.3, 1) 400ms both" }}
          >
            {success.heading}
          </h2>
          <p
            className="mx-auto mt-3 max-w-[46ch] text-[0.95rem] leading-relaxed text-ink-600 motion-reduce:animate-none"
            style={{ animation: "success-scale-in 500ms cubic-bezier(0.16, 1, 0.3, 1) 500ms both" }}
          >
            {success.body}
          </p>
        </div>

        {/* Ticket perforated divider */}
        <div
          className="relative flex items-center motion-reduce:animate-none"
          style={{ animation: "success-scale-in 500ms cubic-bezier(0.16, 1, 0.3, 1) 550ms both" }}
          aria-hidden="true"
        >
          {/* Left notch */}
          <div className="relative -left-3 size-6 shrink-0 rounded-full bg-background border border-ink-200" />
          {/* Dashed line */}
          <div className="flex-1 border-t-2 border-dashed border-ink-200" />
          {/* Right notch */}
          <div className="relative -right-3 size-6 shrink-0 rounded-full bg-background border border-ink-200" />
        </div>

        {/* Bottom section — ID + actions */}
        <div
          className="relative bg-ink-50/50 px-8 pt-8 pb-10 sm:px-12 sm:pt-10 sm:pb-12 motion-reduce:animate-none"
          style={{ animation: "success-scale-in 500ms cubic-bezier(0.16, 1, 0.3, 1) 600ms both" }}
        >
          {/* Registration ID */}
          <div className="text-center">
            <span className="eyebrow block text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-ink-500">
              {success.idLabel}
            </span>
            <span
              className="mt-2 block font-heading text-[clamp(1.75rem,1.2rem+2.2vw,2.75rem)] font-extrabold tracking-[0.14em] text-ink-950 tabular-nums select-all"
            >
              {result.registrationId}
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={result.passUrl}
              download={`startup-e-plus-pass-${result.registrationId}.pdf`}
              className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-button bg-emerald-600 px-7 text-[0.92rem] font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg sm:w-auto"
            >
              <Download aria-hidden="true" className="size-[1.1rem]" strokeWidth={2.2} />
              {success.download}
            </a>

            <Link
              href={result.next}
              className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-button border border-ink-300 bg-white px-7 text-[0.92rem] font-medium text-ink-800 transition-all hover:border-ink-400 hover:bg-ink-100/70 sm:w-auto"
            >
              {success.nextLabel}: {result.pathway}
              <ArrowRight aria-hidden="true" className="size-[1.1rem]" strokeWidth={2.2} />
            </Link>
          </div>
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
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
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
