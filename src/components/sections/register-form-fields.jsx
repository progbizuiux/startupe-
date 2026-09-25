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
import { Field, controlClasses, describedBy } from "@/components/ui/field";
import { RegisterPassCard } from "@/components/sections/register-pass-card";

/**
 * The front-door form, and the hand-off that replaces it on success.
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
export function RegisterFormFields({ districts, stages, labels, stageLabel, stageHint, success }) {
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
      email: "",
      whatsapp: "",
      district: "",
      stage: "",
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
      if (!res.ok || !payload.registrationId) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }

      /* Name and district come from what was just typed, not from the response:
         the server has no reason to echo personal details back, and these are
         only needed to draw the card on screen. */
      setResult({ ...payload, fullName: values.fullName, district: values.district });
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
    const issued = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    /* base64 -> Blob, built on demand so a large data: URL is never put in the
       DOM and the file gets a proper name. */
    const downloadPass = () => {
      const bytes = Uint8Array.from(atob(result.pass), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `startup-e-plus-pass-${result.registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className="rounded-card border border-border bg-background p-6 sm:p-8"
      >
        <h3 className="text-h5">{success.heading}</h3>
        <p className="mt-3 max-w-[52ch] text-muted-foreground">{success.body}</p>

        <div className="mt-6 rounded-card bg-muted px-5 py-4">
          <span className="eyebrow block text-caption text-muted-foreground">
            {success.idLabel}
          </span>
          <span className="mt-1 block font-heading text-h4 font-medium tracking-[0.1em] tabular-nums select-all">
            {result.registrationId}
          </span>
        </div>

        <RegisterPassCard
          className="mt-6"
          registrationId={result.registrationId}
          fullName={result.fullName}
          district={result.district}
          pathway={result.pathway}
          issued={issued}
        />

        <div className="mt-6 flex flex-wrap gap-4">
          <Button type="button" size="md" onClick={downloadPass} className="w-full sm:w-auto">
            <Download aria-hidden="true" className="size-4" strokeWidth={2} />
            {success.download}
          </Button>
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

        <Field id="email" label={labels.email} required error={err("email")}>
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
          id="whatsapp"
          label={labels.whatsapp}
          required
          hint={labels.whatsappHint}
          error={err("whatsapp")}
        >
          <input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            className={controlClasses}
            aria-invalid={!!err("whatsapp")}
            aria-describedby={describedBy("whatsapp", { hint: true, error: err("whatsapp") })}
            {...register("whatsapp")}
          />
        </Field>

        <Field id="district" label={labels.district} required error={err("district")}>
          <select
            id="district"
            className={controlClasses}
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
          </select>
        </Field>
      </div>

      {/* A radio group, not a <Field>: Field ties one <label htmlFor> to one
          control, which is wrong for a group. This is the fieldset/legend idiom
          the beginner form already uses for its funding-history checkboxes. Two
          options also do not justify a select, which on a phone costs a sheet
          to open, choose and dismiss for one bit of information. */}
      <fieldset>
        <legend className="text-small font-medium text-foreground">
          {stageLabel}
          <span aria-hidden="true" className="ml-0.5 text-destructive">
            *
          </span>
        </legend>
        <p className="mt-1 text-caption text-muted-foreground">{stageHint}</p>

        <div className="mt-3 grid gap-3">
          {stages.map((stage) => (
            <label
              key={stage.value}
              className="flex cursor-pointer items-start gap-3 rounded-input border border-border bg-background px-4 py-3 transition-colors has-[:checked]:border-indigo has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40"
            >
              <input
                type="radio"
                value={stage.value}
                className="mt-1 size-4 shrink-0 accent-primary"
                aria-describedby={describedBy("stage", { error: err("stage") })}
                {...register("stage")}
              />
              <span>
                <span className="block text-small font-medium text-foreground">{stage.title}</span>
                <span className="mt-1 block text-caption text-muted-foreground">{stage.text}</span>
              </span>
            </label>
          ))}
        </div>

        {err("stage") && (
          <p id="stage-error" role="alert" className="mt-2 text-caption text-destructive">
            {err("stage")}
          </p>
        )}
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
