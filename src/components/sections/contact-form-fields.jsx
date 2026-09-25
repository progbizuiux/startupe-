"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckBig } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { contactSchema } from "@/lib/contact-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, controlClasses, describedBy } from "@/components/ui/field";

/** Reply choices that need a number, matching the superRefine in the schema. */
const NEEDS_PHONE = ["Phone call", "WhatsApp"];

/**
 * The contact form's fields — the client island inside contact-form.jsx.
 *
 * Validation lives in src/lib/contact-schema.js and is shared with the API
 * route, so the browser and the server enforce exactly the same rules; the
 * client copy is there for fast feedback, not as the gate.
 *
 * The block carries no data-reveal and no entrance animation: a tween in flight
 * over a control that can take focus is worse than no motion at all, and the
 * success panel changes the block's height anyway.
 */
export function ContactFormFields({ topics, channels, labels, success }) {
  const [submitted, setSubmitted] = useState(false);

  /* The panel replaces the form, so the submit button is unmounted and focus
     would otherwise fall back to <body> — a keyboard user would be dropped at
     the top of the document and a screen reader would announce nothing, since
     the toast is transient. Move focus to the panel and let role="status"
     announce it. */
  const doneRef = useRef(null);
  useEffect(() => {
    if (submitted) {
      doneRef.current?.focus();
      doneRef.current?.scrollIntoView({ block: "center" });
    }
  }, [submitted]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      topic: "",
      organisation: "",
      preferredReply: "",
      message: "",
      website: "",
    },
  });

  /* useWatch, not form.watch: watch() is a plain subscription the React
     Compiler cannot track, which trips react-hooks/incompatible-library */
  const preferredReply = useWatch({ control, name: "preferredReply" });
  const phoneRequired = NEEDS_PHONE.includes(preferredReply);

  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setSubmitted(true);
      toast.success("Message sent.");
    } catch {
      toast.error(
        `Could not send your message. Please try again, or email ${siteConfig.contact.email}.`,
      );
    }
  };

  if (submitted) {
    return (
      /* bg-background, not bg-muted: this band is already grey */
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className="rounded-card border border-border bg-background p-8"
      >
        <CircleCheckBig aria-hidden="true" className="size-9 text-primary" />
        <h3 className="mt-4 text-h5">{success.heading}</h3>
        <p className="mt-3 max-w-[52ch] text-muted-foreground">{success.body}</p>
      </div>
    );
  }

  const err = (name) => errors[name]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 eyebrow text-muted-foreground">{labels.you}</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="fullName" label={labels.fullName} required error={err("fullName")}>
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

          {/* The number is only needed when the visitor asks to be called or
              messaged, so the label follows the reply choice rather than
              claiming "Optional" and then rejecting a blank field. */}
          <Field
            id="phone"
            label={labels.phone}
            required={phoneRequired}
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
            id="organisation"
            label={labels.organisation}
            hint={labels.organisationHint}
            error={err("organisation")}
          >
            <input
              id="organisation"
              type="text"
              autoComplete="organization"
              className={controlClasses}
              aria-invalid={!!err("organisation")}
              aria-describedby={describedBy("organisation", {
                hint: true,
                error: err("organisation"),
              })}
              {...register("organisation")}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 eyebrow text-muted-foreground">{labels.message}</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="topic" label={labels.topic} required error={err("topic")}>
            <select
              id="topic"
              className={controlClasses}
              aria-invalid={!!err("topic")}
              aria-describedby={describedBy("topic", { error: err("topic") })}
              {...register("topic")}
            >
              <option value="">Select…</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="preferredReply"
            label={labels.preferredReply}
            required
            error={err("preferredReply")}
          >
            <select
              id="preferredReply"
              className={controlClasses}
              aria-invalid={!!err("preferredReply")}
              aria-describedby={describedBy("preferredReply", { error: err("preferredReply") })}
              {...register("preferredReply")}
            >
              <option value="">Select…</option>
              {channels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="message"
            label={labels.messageField}
            required
            hint={labels.messageHint}
            error={err("message")}
            className="sm:col-span-2"
          >
            <textarea
              id="message"
              rows={6}
              className={cn(controlClasses, "resize-y")}
              aria-invalid={!!err("message")}
              aria-describedby={describedBy("message", { hint: true, error: err("message") })}
              {...register("message")}
            />
          </Field>
        </div>
      </fieldset>

      {/* Honeypot. Not rendered through <Field>, which would print a label and an
          "Optional" badge; hidden from assistive tech and taken out of the tab
          order, so only a bot filling every input will touch it. The API route
          drops anything carrying it and answers 201 as though it worked. */}
      <div aria-hidden="true" className="hidden">
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {/* Full width on a phone, where it is the only thing to press; its natural
          width from sm, where a stretched pill looks like a banner. */}
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
