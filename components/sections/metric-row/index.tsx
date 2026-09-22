import { cn } from "@/lib/cn";
import type { MetricRowProps } from "./schema";

const COLUMNS: Record<number, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function MetricRow({ eyebrow, heading, items }: MetricRowProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        {(eyebrow || heading) && (
          <div className="mb-9">
            {eyebrow && <p className="label text-accent">{eyebrow}</p>}
            {heading && <h2 className="mt-4 max-w-[36ch] text-h1">{heading}</h2>}
          </div>
        )}

        {/* The column count follows the ITEM count. The grid paints its gaps
            with --color-line, so a fixed four-column track with two metrics in
            it draws a half-width empty cell that reads as a missing number.
            Written out rather than interpolated because Tailwind only sees
            class names that appear literally in the source. */}
        <dl className={cn("grid gap-px border-y border-line bg-line", COLUMNS[Math.min(items.length, 4)])}>
          {items.map((item) => (
            <div key={item.label} className="bg-canvas px-7 pt-7 pb-8">
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block text-display leading-none font-bold tracking-[-0.04em] tabular-nums text-accent">
                  {item.value}
                </span>
                <span className="mt-4 block text-h5 font-bold">{item.label}</span>
                {item.note && <span className="mt-2 block text-sm text-muted">{item.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
