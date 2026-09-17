import Link from "next/link";
import { SectionHead } from "@/components/ui/section-head";
import type { PillRowProps } from "./schema";

const PILL =
  "inline-block rounded-pill border border-band-line bg-band px-6 py-3.5 text-md transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-tint hover:bg-canvas";

export function PillRow({ eyebrow, heading, standfirst, items }: PillRowProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-gutter pt-band">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        <ul className="mt-10 flex flex-wrap gap-3">
          {items.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link href={item.href} className={PILL}>
                  {item.label}
                </Link>
              ) : (
                <span className={PILL}>{item.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
