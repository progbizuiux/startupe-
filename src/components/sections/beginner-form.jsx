"use client";

import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { CircleCheckBig, Trash2 } from "lucide-react";
import {
  CURRENT_STAGES,
  FUNDING_HISTORY,
  MAX_FOUNDERS,
  OPERATIONAL_HURDLES,
  REGISTRATION_TYPES,
  beginner,
} from "@/data/register";
import { beginnerSchema } from "@/lib/register-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, controlClasses, describedBy } from "@/components/ui/field";

const emptyFounder = { name: "", email: "", phone: "", background: "" };

/**
 * Portal 2 ("The Beginner") registration form.
 *
 * Validation is shared with the API route via src/lib/register-schema.js.
 * Founders are a field array so co-founders can be added and removed; funding
 * history is a checkbox group because a company can have been through several.
 */
export function BeginnerForm() {
  const [submitted, setSubmitted] = useState(false);

  /* The panel replaces a form that is taller than the screen, so whoever pressed
     submit at the bottom would be left staring at blank space below it. */
  const doneRef = useRef(null);
  useEffect(() => {
    if (submitted) doneRef.current?.scrollIntoView({ block: "center" });
  }, [submitted]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(beginnerSchema),
    mode: "onBlur",
    defaultValues: {
      founders: [emptyFounder],
      legalName: "",
      registrationType: "",
      udyamNumber: "",
      incorporationDate: "",
      currentStage: "",
      fundingHistory: [],
      operationalHurdle: "",
      ipAcknowledged: false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "founders" });

  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, portal: "beginner" }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setSubmitted(true);
      toast.success("Registration received.");
    } catch {
      toast.error(
        `Could not send your registration. Please try again, or email ${siteConfig.contact.email}.`,
      );
    }
  };

  if (submitted) {
    return (
      <div ref={doneRef} className="rounded-card border border-border bg-muted p-8">
        <CircleCheckBig aria-hidden="true" className="size-9 text-primary" />
        <h2 className="mt-4 text-h5">Registration received</h2>
        <p className="mt-3 text-muted-foreground">
          Thanks for registering. The Startup E team will follow up on mentoring, compliance support
          and the KSUM seed capital routes open to you.
        </p>
      </div>
    );
  }

  const err = (name) => errors[name]?.message;
  const founderErr = (i, name) => errors.founders?.[i]?.[name]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      {/* ---------- Founders ---------- */}
      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 eyebrow text-muted-foreground">Founder &amp; co-founders</legend>

        {fields.map((field, i) => (
          <div key={field.id} className="rounded-card border border-border p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-small font-medium">
                {i === 0 ? "Primary founder" : `Co-founder ${i}`}
              </h3>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="inline-flex items-center gap-1.5 text-caption text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id={`founders.${i}.name`} label="Name" required error={founderErr(i, "name")}>
                <input
                  id={`founders.${i}.name`}
                  type="text"
                  className={controlClasses}
                  aria-invalid={!!founderErr(i, "name")}
                  {...register(`founders.${i}.name`)}
                />
              </Field>

              <Field
                id={`founders.${i}.phone`}
                label="Contact number"
                required
                error={founderErr(i, "phone")}
              >
                <input
                  id={`founders.${i}.phone`}
                  type="tel"
                  inputMode="tel"
                  placeholder="98765 43210"
                  className={controlClasses}
                  aria-invalid={!!founderErr(i, "phone")}
                  {...register(`founders.${i}.phone`)}
                />
              </Field>

              <Field
                id={`founders.${i}.email`}
                label="Email"
                required
                error={founderErr(i, "email")}
                className="sm:col-span-2"
              >
                <input
                  id={`founders.${i}.email`}
                  type="email"
                  className={controlClasses}
                  aria-invalid={!!founderErr(i, "email")}
                  {...register(`founders.${i}.email`)}
                />
              </Field>

              <Field
                id={`founders.${i}.background`}
                label="Educational / professional background"
                required
                error={founderErr(i, "background")}
                className="sm:col-span-2"
              >
                <textarea
                  id={`founders.${i}.background`}
                  rows={3}
                  className={cn(controlClasses, "resize-y")}
                  aria-invalid={!!founderErr(i, "background")}
                  {...register(`founders.${i}.background`)}
                />
              </Field>
            </div>
          </div>
        ))}

        {fields.length < MAX_FOUNDERS && (
          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => append(emptyFounder)}>
              Add a co-founder
            </Button>
          </div>
        )}
        {err("founders") && (
          <p role="alert" className="text-caption text-destructive">
            {err("founders")}
          </p>
        )}
      </fieldset>

      {/* ---------- Entity ---------- */}
      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 eyebrow text-muted-foreground">Entity details</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            id="legalName"
            label="Registered legal name"
            required
            error={err("legalName")}
            className="sm:col-span-2"
          >
            <input
              id="legalName"
              type="text"
              autoComplete="organization"
              className={controlClasses}
              aria-invalid={!!err("legalName")}
              aria-describedby={describedBy("legalName", { error: err("legalName") })}
              {...register("legalName")}
            />
          </Field>

          <Field
            id="registrationType"
            label="Registration type"
            required
            error={err("registrationType")}
          >
            <select
              id="registrationType"
              className={controlClasses}
              aria-invalid={!!err("registrationType")}
              aria-describedby={describedBy("registrationType", { error: err("registrationType") })}
              {...register("registrationType")}
            >
              <option value="">Select…</option>
              {REGISTRATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="udyamNumber"
            label="Udyam number"
            hint="If you have one — format UDYAM-KL-00-0000000"
            error={err("udyamNumber")}
          >
            <input
              id="udyamNumber"
              type="text"
              placeholder="UDYAM-KL-00-0000000"
              className={controlClasses}
              aria-invalid={!!err("udyamNumber")}
              aria-describedby={describedBy("udyamNumber", {
                hint: true,
                error: err("udyamNumber"),
              })}
              {...register("udyamNumber")}
            />
          </Field>

          <Field
            id="incorporationDate"
            label="Date of incorporation"
            required
            error={err("incorporationDate")}
          >
            <input
              id="incorporationDate"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              className={controlClasses}
              aria-invalid={!!err("incorporationDate")}
              aria-describedby={describedBy("incorporationDate", {
                error: err("incorporationDate"),
              })}
              {...register("incorporationDate")}
            />
          </Field>
        </div>
      </fieldset>

      {/* ---------- Stage, funding, hurdle ---------- */}
      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 eyebrow text-muted-foreground">Where you are</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="currentStage" label="Current stage" required error={err("currentStage")}>
            <select
              id="currentStage"
              className={controlClasses}
              aria-invalid={!!err("currentStage")}
              aria-describedby={describedBy("currentStage", { error: err("currentStage") })}
              {...register("currentStage")}
            >
              <option value="">Select…</option>
              {CURRENT_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="operationalHurdle"
            label="Most immediate hurdle"
            required
            error={err("operationalHurdle")}
          >
            <select
              id="operationalHurdle"
              className={controlClasses}
              aria-invalid={!!err("operationalHurdle")}
              aria-describedby={describedBy("operationalHurdle", {
                error: err("operationalHurdle"),
              })}
              {...register("operationalHurdle")}
            >
              <option value="">Select…</option>
              {OPERATIONAL_HURDLES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* multi-select: a company can have been through several of these */}
        <fieldset>
          <legend className="text-small font-medium text-foreground">
            Funding history
            <span aria-hidden="true" className="ml-0.5 text-destructive">
              *
            </span>
          </legend>
          <p className="mt-1 text-caption text-muted-foreground">Select all that apply</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {FUNDING_HISTORY.map((source) => (
              <label
                key={source}
                className="flex cursor-pointer items-center gap-3 rounded-input border border-border px-4 py-3"
              >
                <input
                  type="checkbox"
                  value={source}
                  className="size-4 shrink-0 accent-primary"
                  {...register("fundingHistory")}
                />
                <span className="text-small">{source}</span>
              </label>
            ))}
          </div>
          {err("fundingHistory") && (
            <p role="alert" className="mt-2 text-caption text-destructive">
              {err("fundingHistory")}
            </p>
          )}
        </fieldset>
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
          <span className="text-small text-foreground">{beginner.ipTerms}</span>
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
