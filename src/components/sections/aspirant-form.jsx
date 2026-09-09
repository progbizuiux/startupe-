"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import {
  ACADEMIC_STATUSES,
  ENROLLED_STATUSES,
  GENDERS,
  KERALA_DISTRICTS,
  PITCH_WORD_LIMIT,
  PRIMARY_NEEDS,
  SECTORS,
  aspirant,
} from "@/data/register";
import { aspirantSchema, countWords } from "@/lib/register-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, controlClasses, describedBy } from "@/components/ui/field";

/**
 * Portal 1 ("The Aspirant") registration form.
 *
 * Validation lives in src/lib/register-schema.js and is shared with the API
 * route, so the browser and the server enforce exactly the same rules - the
 * client copy is there for fast feedback, not as the gate.
 */
export function AspirantForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(aspirantSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      age: "",
      gender: "",
      district: "",
      whatsapp: "",
      email: "",
      academicStatus: "",
      institution: "",
      pitchSummary: "",
      pitchVideoUrl: "",
      sector: "",
      primaryNeed: "",
      ipAcknowledged: false,
    },
  });

  /* useWatch, not form.watch: watch() is a plain subscription the React
     Compiler cannot track, which trips react-hooks/incompatible-library */
  const academicStatus = useWatch({ control, name: "academicStatus" });
  const pitchSummary = useWatch({ control, name: "pitchSummary" });
  const isEnrolled = ENROLLED_STATUSES.includes(academicStatus);
  const pitchWords = countWords(pitchSummary);

  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, portal: "aspirant" }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setSubmitted(true);
    } catch {
      toast.error(
        `Could not send your registration. Please try again, or email ${siteConfig.contact.email}.`,
      );
    }
  };

  if (submitted) {
    return (
      <div className="rounded-card border border-border bg-muted p-8">
        <h2 className="text-h5">Registration received</h2>
        <p className="mt-3 text-muted-foreground">
          Thanks for registering. The Startup E team will be in touch on WhatsApp with your nearest
          Campus E-Club and the next Zonal Idea Hackathon date.
        </p>
      </div>
    );
  }

  const err = (name) => errors[name]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      {/* ---------- About you ---------- */}
      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 eyebrow text-muted-foreground">About you</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="fullName" label="Full name" required error={err("fullName")}>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className={controlClasses}
              aria-invalid={!!err("fullName")}
              aria-describedby={describedBy("fullName", { error: err("fullName") })}
              {...register("fullName")}
            />
          </Field>

          <Field id="age" label="Age" required error={err("age")}>
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

          <Field id="gender" label="Gender" required error={err("gender")}>
            <select
              id="gender"
              className={controlClasses}
              aria-invalid={!!err("gender")}
              aria-describedby={describedBy("gender", { error: err("gender") })}
              {...register("gender")}
            >
              <option value="">Select…</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>

          <Field id="district" label="District" required error={err("district")}>
            <select
              id="district"
              className={controlClasses}
              aria-invalid={!!err("district")}
              aria-describedby={describedBy("district", { error: err("district") })}
              {...register("district")}
            >
              <option value="">Select…</option>
              {KERALA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="whatsapp"
            label="WhatsApp number"
            required
            hint="10-digit mobile number"
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

          <Field id="email" label="Email" required error={err("email")}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={controlClasses}
              aria-invalid={!!err("email")}
              aria-describedby={describedBy("email", { error: err("email") })}
              {...register("email")}
            />
          </Field>
        </div>
      </fieldset>

      {/* ---------- Study / work ---------- */}
      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 eyebrow text-muted-foreground">Study or work</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="academicStatus" label="Current status" required error={err("academicStatus")}>
            <select
              id="academicStatus"
              className={controlClasses}
              aria-invalid={!!err("academicStatus")}
              aria-describedby={describedBy("academicStatus", { error: err("academicStatus") })}
              {...register("academicStatus")}
            >
              <option value="">Select…</option>
              {ACADEMIC_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="institution"
            label="Institution"
            required={isEnrolled}
            hint={isEnrolled ? undefined : "Only needed if you are currently enrolled"}
            error={err("institution")}
          >
            <input
              id="institution"
              type="text"
              autoComplete="organization"
              className={controlClasses}
              aria-invalid={!!err("institution")}
              aria-describedby={describedBy("institution", {
                hint: !isEnrolled,
                error: err("institution"),
              })}
              {...register("institution")}
            />
          </Field>
        </div>
      </fieldset>

      {/* ---------- The idea ---------- */}
      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 eyebrow text-muted-foreground">Your idea</legend>
        <p className="-mt-2 text-small text-muted-foreground">
          Give us a short written pitch or a link to a 60-second video — either is fine.
        </p>

        {/* the live counter doubles as this field's hint (hence the -hint id),
            so the limit is not stated twice under the textarea */}
        <Field id="pitchSummary" label="Pitch summary" error={err("pitchSummary")}>
          <textarea
            id="pitchSummary"
            rows={5}
            className={cn(controlClasses, "resize-y")}
            aria-invalid={!!err("pitchSummary")}
            aria-describedby={describedBy("pitchSummary", {
              hint: true,
              error: err("pitchSummary"),
            })}
            {...register("pitchSummary")}
          />
          <p
            id="pitchSummary-hint"
            aria-live="polite"
            className={cn(
              "text-caption",
              pitchWords > PITCH_WORD_LIMIT ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {pitchWords} / {PITCH_WORD_LIMIT} words maximum
          </p>
        </Field>

        <Field
          id="pitchVideoUrl"
          label="Or a 60-second video URL"
          hint="YouTube, Drive or any public link"
          error={err("pitchVideoUrl")}
        >
          <input
            id="pitchVideoUrl"
            type="url"
            placeholder="https://"
            className={controlClasses}
            aria-invalid={!!err("pitchVideoUrl")}
            aria-describedby={describedBy("pitchVideoUrl", {
              hint: true,
              error: err("pitchVideoUrl"),
            })}
            {...register("pitchVideoUrl")}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="sector" label="Sector interest" required error={err("sector")}>
            <select
              id="sector"
              className={controlClasses}
              aria-invalid={!!err("sector")}
              aria-describedby={describedBy("sector", { error: err("sector") })}
              {...register("sector")}
            >
              <option value="">Select…</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="primaryNeed"
            label="Primary immediate need"
            required
            error={err("primaryNeed")}
          >
            <select
              id="primaryNeed"
              className={controlClasses}
              aria-invalid={!!err("primaryNeed")}
              aria-describedby={describedBy("primaryNeed", { error: err("primaryNeed") })}
              {...register("primaryNeed")}
            >
              <option value="">Select…</option>
              {PRIMARY_NEEDS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      {/* ---------- Mandatory IP acknowledgment ---------- */}
      <div className="rounded-card border border-border bg-muted p-6">
        <label htmlFor="ipAcknowledged" className="flex cursor-pointer items-start gap-3">
          <input
            id="ipAcknowledged"
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-primary"
            aria-invalid={!!err("ipAcknowledged")}
            aria-describedby={describedBy("ipAcknowledged", { error: err("ipAcknowledged") })}
            {...register("ipAcknowledged")}
          />
          <span className="text-small text-foreground">{aspirant.ipTerms}</span>
        </label>
        {err("ipAcknowledged") && (
          <p id="ipAcknowledged-error" role="alert" className="mt-2 text-caption text-destructive">
            {err("ipAcknowledged")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="md" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Submit registration"}
        </Button>
        <span className="text-caption text-muted-foreground">
          <span aria-hidden="true" className="text-destructive">
            *
          </span>{" "}
          required
        </span>
      </div>
    </form>
  );
}
