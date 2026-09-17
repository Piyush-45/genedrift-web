import { SectionHead } from "@/components/ui/section-head";
import type { FaqAccordionProps } from "./schema";

export function FaqAccordion({ eyebrow, heading, standfirst, items }: FaqAccordionProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        <div className="mt-11 border-t border-line">
          {items.map((item) => (
            // No `name` attribute: answers are not exclusive, so a reader can
            // open several and compare them.
            <details key={item.question} className="disclosure border-b border-line">
              <summary className="flex cursor-pointer items-start justify-between gap-6 py-6">
                <span className="text-h5 font-bold">{item.question}</span>
                <span className="disclosure-chevron mt-1 shrink-0 text-accent transition-transform duration-300 ease-[var(--ease-out-soft)]">
                  <svg
                    aria-hidden
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="max-w-[72ch] pb-6.5 text-body text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
