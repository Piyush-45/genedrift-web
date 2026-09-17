import { cn } from "@/lib/cn";
import { SectionHead } from "@/components/ui/section-head";
import type { CapabilityStatus as Status, Market } from "@/lib/map/markets";
import type { CapabilityStatusProps } from "./schema";

const LABEL: Record<Status, string> = {
  available: "Available",
  upcoming: "Upcoming",
  none: "Not available",
};

const TONE: Record<Status, string> = {
  available: "text-status-available",
  upcoming: "text-status-upcoming",
  none: "text-status-none",
};

const DOT: Record<Status, string> = {
  available: "bg-status-available",
  upcoming: "bg-status-upcoming",
  none: "bg-status-none",
};

export function CapabilityStatus({
  eyebrow,
  heading,
  standfirst,
  notes,
  footnote,
  market,
}: CapabilityStatusProps & { market?: Market }) {
  if (!market || market.capabilities.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        <ul className="mt-11 border-t border-line">
          {market.capabilities.map((capability) => (
            <li
              key={capability.name}
              className="grid gap-x-8 gap-y-2 border-b border-line py-6.5 sm:grid-cols-[1fr_auto] sm:items-baseline"
            >
              <div>
                <h3 className="text-h4">{capability.name}</h3>
                {notes[capability.name] && (
                  <p className="mt-2 max-w-[62ch] text-sm text-muted">
                    {notes[capability.name]}
                  </p>
                )}
              </div>

              <span
                className={cn(
                  "flex items-center gap-2.5 text-md font-semibold whitespace-nowrap",
                  TONE[capability.status],
                )}
              >
                <span aria-hidden className={cn("block size-2 rounded-pill", DOT[capability.status])} />
                {LABEL[capability.status]}
              </span>
            </li>
          ))}
        </ul>

        {footnote && <p className="label mt-5 text-faint">{footnote}</p>}
      </div>
    </section>
  );
}
