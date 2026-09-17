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
}: {
  name: string;
  label: string;
  error?: string;
  type?: string;
  required?: boolean;
  wide?: boolean;
  rows?: number;
  defaultValue?: string;
}) {
  const id = `contact-${name}`;
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
          className="rounded-control bg-canvas px-4 py-3.5 text-md text-ink outline-none"
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
          className="rounded-control bg-canvas px-4 py-3.5 text-md text-ink outline-none"
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
  const [state, action, pending] = useActionState(submitContact, INITIAL);
  const kept = state.values ?? {};

  return (
    <section className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto max-w-body">
        <div className="rounded-hero bg-accent px-8 py-10 text-on-accent lg:px-11.5 lg:py-12">
          <p className="label text-on-accent-muted">{config.eyebrow}</p>
          <h1 className="mt-4 max-w-[24ch] text-h1 leading-[1.16] font-bold">{config.heading}</h1>
          <p className="mt-5 max-w-[56ch] text-lead text-on-accent-muted">{config.standfirst}</p>

          {!config.enabled ? (
            /* Disabled on purpose — see lib/forms/contact.ts. A form that
               accepts a safety report and drops it is worse than no form. */
            <div role="note" className="mt-9 max-w-[52ch] rounded-panel bg-canvas px-7 py-6">
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
          ) : state.status === "success" ? (
            <div role="status" className="mt-9 max-w-[52ch] rounded-panel bg-canvas px-7 py-6">
              <p className="text-body text-ink">{state.message}</p>
            </div>
          ) : (
            <form action={action} className="mt-9 max-w-[46rem]">
              <input type="hidden" name="intent" value={intent} />

              {/* Honeypot — off-screen, not display:none, so bots still fill it. */}
              <div aria-hidden className="absolute -left-[9999px]">
                <label htmlFor="contact-website">Website</label>
                <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="name" label="Name" error={state.fieldErrors?.name}
                  defaultValue={kept.name} required />
                <Field
                  name="email"
                  label="Work email"
                  type="email"
                  error={state.fieldErrors?.email}
                  defaultValue={kept.email}
                  required
                />
                <Field name="company" label="Company" error={state.fieldErrors?.company}
                  defaultValue={kept.company} required />
                <Field name="country" label="Country" error={state.fieldErrors?.country}
                  defaultValue={kept.country} />
                <Field name="phone" label="Contact number" error={state.fieldErrors?.phone}
                  defaultValue={kept.phone} />
                <span className="hidden sm:block" />
                <Field
                  name="message"
                  label="Purpose / remarks"
                  rows={5}
                  wide
                  error={state.fieldErrors?.message}
                  defaultValue={kept.message}
                  required
                />
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
                {pending ? "Sending…" : config.submitLabel}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
