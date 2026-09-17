import Link from "next/link";
import type { PageHeadProps } from "./schema";

export function PageHead({ eyebrow, heading, headingTail, standfirst, actions }: PageHeadProps) {
  return (
    <section className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto max-w-body">
        <p className="label flex items-center gap-2.5 text-accent">
          <span aria-hidden className="block size-1.5 bg-accent" />
          {eyebrow}
        </p>

        <h1 className="mt-6 max-w-[26ch] text-display font-bold">
          {heading}
          {headingTail ? <span className="text-dim"> {headingTail}</span> : null}
        </h1>

        {standfirst && <p className="mt-6 max-w-[62ch] text-lead text-muted">{standfirst}</p>}

        {actions.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={
                  a.variant === "solid"
                    ? "rounded-control bg-accent px-6.5 py-3.5 text-md font-semibold text-on-accent transition-colors hover:bg-deep"
                    : "text-md font-semibold text-deep transition-colors hover:text-accent"
                }
              >
                {a.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
