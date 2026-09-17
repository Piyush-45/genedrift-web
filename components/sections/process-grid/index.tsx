import { SectionHead } from "@/components/ui/section-head";
import type { ProcessGridProps } from "./schema";

export function ProcessGrid({ eyebrow, heading, standfirst, stages }: ProcessGridProps) {
  if (stages.length === 0) return null;

  return (
    <section className="mt-section bg-band px-gutter py-band">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        {/* One-pixel gaps over a band-line ground draw the grid rules without
            a border on every cell — no doubled lines, no odd corners. */}
        <ol className="mt-12 grid gap-px border border-band-line bg-band-line sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, i) => (
            <li
              key={stage.title}
              className="flex items-start gap-3.5 bg-canvas px-6 pt-6 pb-6.5 transition-colors duration-200 hover:bg-band-tint"
            >
              <span className="pt-[3px] font-mono text-label text-dim tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-body font-bold tracking-[-0.02em]">{stage.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{stage.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
