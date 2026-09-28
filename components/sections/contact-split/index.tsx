import Link from "next/link";
import { cn } from "@/lib/cn";
import { EnquiryForm } from "@/components/sections/contact-form";
import type { ContactSplitProps } from "./schema";

export function ContactSplit({
  eyebrow,
  heading,
  submitLabel,
  routes,
  generalLabel,
  generalEmail,
}: ContactSplitProps) {
  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto flex max-w-body flex-col gap-5.5 lg:flex-row lg:items-stretch">
        <div className="grow rounded-hero bg-accent px-11.5 py-12 text-on-accent">
          <p className="label text-on-accent-muted">{eyebrow}</p>
          <h2 className="mt-4 max-w-[32ch] text-h2 leading-[1.18]">{heading}</h2>

          {/* The real enquiry form, submitting in place. It used to be
              drawn boxes plus a link to /contact, which read as a broken
              form: visitors clicked into fields that could not be typed in.
              `fields` and `submitHref` in the schema are no longer used for
              rendering; kept so existing CMS records still validate. */}
          <EnquiryForm
            intent="enquiry"
            idPrefix="split"
            submitLabel={submitLabel}
            className="mt-7.5"
          />
        </div>

        <div className="flex shrink-0 flex-col gap-3 lg:w-100">
          {routes.map((route) => {
            const safety = route.emphasis === "safety";
            const card = (
              <>
                <p
                  className={cn(
                    "text-lead font-semibold leading-snug",
                    safety && "text-deep",
                  )}
                >
                  {route.title}
                </p>
                <p className={cn("mt-2 text-md leading-[1.55]", safety ? "text-mid" : "text-muted")}>
                  {route.body}
                </p>
                {route.linkLabel && (
                  <p className="mt-3 text-sm font-semibold text-accent">{route.linkLabel}</p>
                )}
              </>
            );

            const className = cn(
              "block rounded-panel px-6.5 py-6 transition-[background-color,transform] duration-[220ms] hover:-translate-y-0.5",
              safety ? "bg-lavender" : "bg-surface hover:bg-lavender",
            );

            return route.href ? (
              <Link key={route.title} href={route.href} className={className}>
                {card}
              </Link>
            ) : (
              <div key={route.title} className={className}>
                {card}
              </div>
            );
          })}

          {generalEmail && (
            <div className="flex grow flex-col justify-center rounded-panel bg-surface px-6.5 py-6">
              <p className="text-md text-slate">{generalLabel}</p>
              <a
                href={`mailto:${generalEmail}`}
                className="mt-1.5 text-lead font-semibold text-accent"
              >
                {generalEmail}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
