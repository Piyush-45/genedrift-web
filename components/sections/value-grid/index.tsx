import type { ValueGridProps } from "./schema";

export function ValueGrid({ eyebrow, heading, items }: ValueGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-section bg-deep px-gutter py-band text-on-deep">
      <div className="mx-auto max-w-body">
        <p className="label text-on-deep-accent">{eyebrow}</p>
        <h2 className="mt-5 max-w-[34ch] text-h1 leading-[1.12]">{heading}</h2>

        <div className="mt-13 grid gap-x-9 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.title}
              className="border-t border-on-deep-accent/30 py-6 pr-5 transition-[border-color,transform] duration-[240ms] ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-on-deep-accent"
            >
              <h3 className="text-h5">{item.title}</h3>
              <p className="mt-2.5 text-md leading-[1.6] text-on-deep-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
