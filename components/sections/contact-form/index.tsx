"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import { INTENTS, type ContactIntent } from "@/lib/forms/contact";
import { submitContact, type ContactState } from "@/lib/forms/submit";

const INITIAL: ContactState = { status: "idle" };

function Field({
  name,
  label,
  error,
  type = "text",
  required,
  wide,
  rows,
  defaultValue,
  idPrefix = "contact",
}: {
  idPrefix?: string;
  name: string;
  label: string;
  error?: string;
  type?: string;
  required?: boolean;
  wide?: boolean;
  rows?: number;
  defaultValue?: string;
}) {
  const id = `${idPrefix}-${name}`;
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <p className={cn("flex flex-col gap-2", wide && "sm:col-span-2")}>
      <label htmlFor={id} className="label text-on-accent-muted">
        {label}
        {required && <span aria-hidden> *</span>}
      </label>

      {rows ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="rounded-control bg-canvas px-4 py-3.5 text-md text-ink outline-none aria-invalid:ring-2 aria-invalid:ring-on-accent aria-invalid:ring-offset-2 aria-invalid:ring-offset-accent"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="rounded-control bg-canvas px-4 py-3.5 text-md text-ink outline-none aria-invalid:ring-2 aria-invalid:ring-on-accent aria-invalid:ring-offset-2 aria-invalid:ring-offset-accent"
        />
      )}

      {error && (
        <span id={`${id}-error`} className="text-sm font-medium text-on-accent">
          {error}
        </span>
      )}
    </p>
  );
}

export function ContactForm({ intent }: { intent: ContactIntent }) {
  const config = INTENTS[intent];

  return (
    <section className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto max-w-body">
        <div className="rounded-hero bg-accent px-8 py-10 text-on-accent lg:px-11.5 lg:py-12">
          <p className="label text-on-accent-muted">{config.eyebrow}</p>
          <h1 className="mt-4 max-w-[24ch] text-h1 leading-[1.16] font-bold">{config.heading}</h1>
          <p className="mt-5 max-w-[56ch] text-lead text-on-accent-muted">{config.standfirst}</p>
          <EnquiryForm intent={intent} className="mt-9" />
        </div>
      </div>
    </section>
  );
}

/**
 * The working form on its own, without the page shell — so the closing
 * contact block on every page (contact-split) submits in place instead of
 * sending the visitor to /contact first. One form, one server action, one
 * validation schema, wherever it appears.
 *
 * `idPrefix` keeps field ids unique if two forms ever share a page.
 */
export function EnquiryForm({
  intent,
  className,
  idPrefix = "contact",
  submitLabel,
}: {
  intent: ContactIntent;
  className?: string;
  idPrefix?: string;
  submitLabel?: string;
}) {
  const config = INTENTS[intent];
  const [state, action, pending] = useActionState(submitContact, INITIAL);
  const kept = state.values ?? {};
  const f = (name: string) => ({
    name,
    idPrefix,
    error: state.fieldErrors?.[name],
    defaultValue: kept[name],
  });

  if (!config.enabled) {
    /* Disabled on purpose — see lib/forms/contact.ts. A form that accepts a
       safety report and drops it is worse than no form. */
    return (
      <div role="note" className={cn("max-w-[52ch] rounded-panel bg-canvas px-7 py-6", className)}>
        <p className="text-body text-ink">{config.blockedReason}</p>
        {config.fallbackEmail && (
          <a
            href={`mailto:${config.fallbackEmail}`}
            className="mt-4 inline-block text-lead font-semibold text-accent"
          >
            {config.fallbackEmail}
          </a>
        )}
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div role="status" className={cn("max-w-[52ch] rounded-panel bg-canvas px-7 py-6", className)}>
        <p className="text-body text-ink">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className={cn("max-w-[46rem]", className)}>
      <input type="hidden" name="intent" value={intent} />

      {/* Honeypot — off-screen, not display:none, so bots still fill it. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor={`${idPrefix}-website`}>Website</label>
        <input id={`${idPrefix}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field {...f("name")} label="Name" required />
        <Field {...f("email")} label="Work email" type="email" required />
        <Field {...f("company")} label="Company" required />
        <Field {...f("country")} label="Country" />
        <Field {...f("phone")} label="Contact number" />
        <span className="hidden sm:block" />
        <Field {...f("message")} label="Purpose / remarks" rows={5} wide required />
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="mt-5 rounded-control bg-canvas px-4 py-3 text-sm text-ink">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-control bg-deep px-7.5 py-3.5 text-body font-semibold text-on-deep transition-colors hover:bg-ink disabled:opacity-60"
      >
        {pending ? "Sending…" : (submitLabel ?? config.submitLabel)}
      </button>
    </form>
  );
}
