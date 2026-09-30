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
export function RegisterFormFields({ districts, occupations, labels, legends, success }) {
  const [result, setResult] = useState(null);

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
        className="rounded-card border border-border bg-background p-6 sm:p-8"
      >
        <h2 className="text-h5">{success.heading}</h2>
        <p className="mt-3 max-w-[52ch] text-muted-foreground">{success.body}</p>

        <div className="mt-6 rounded-card bg-muted px-5 py-4">
          <span className="eyebrow block text-caption text-muted-foreground">
            {success.idLabel}
          </span>
          <span className="mt-1 block font-heading text-h4 font-medium tracking-[0.1em] tabular-nums select-all">
            {result.registrationId}
          </span>
        </div>

        {/* No preview of the pass on screen. It used to be drawn in HTML beside
            the download, which only worked while this file also drew the PDF —
            now the document is fixed artwork, an HTML lookalike would be a
            second design claiming to be the first, and the two would drift the
            moment the artwork is replaced. The file itself is one tap away. */}

        <div className="mt-6 flex flex-wrap gap-4">
          {/* A plain anchor, not a button with a click handler: `download` on a
              blob URL is what the browser already knows how to do, and it keeps
              working with JavaScript mid-flight or a middle-click. */}
          <a
            href={result.passUrl}
            download={`startup-e-plus-pass-${result.registrationId}.pdf`}
            className={cn(buttonVariants({ size: "md" }), "w-full sm:w-auto")}
          >
            <Download aria-hidden="true" className="size-4" strokeWidth={2} />
            {success.download}
          </a>
          <Link
            href={result.next}
            className={cn(buttonVariants({ variant: "outline", size: "md" }), "w-full sm:w-auto")}
          >
            {success.nextLabel}: {result.pathway}
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    );
  }

  const err = (name) => errors[name]?.message;

  return (
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
    </form>
  );
}
