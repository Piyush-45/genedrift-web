import Link from "next/link";
import { SectionHead } from "@/components/ui/section-head";
import type { SubCapabilityGridProps } from "./schema";

export function SubCapabilityGrid({
  eyebrow,
  heading,
  standfirst,
  items,
  resolvedItems,
}: SubCapabilityGridProps & {
  resolvedItems?: { title: string; href: string; body?: string }[];
}) {
  const list = items.length > 0 ? items : (resolvedItems ?? []);
  if (list.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        <ul className="mt-11 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item, i) => (
            <li key={item.href} className="bg-canvas">
              <Link
                href={item.href}
                className="group flex h-full flex-col px-7.5 pt-7 pb-8 transition-colors hover:bg-lavender"
              >
                <span className="font-mono text-label text-dim tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-4.5 block text-h4 font-bold group-hover:text-accent">
                  {item.title}
                </span>
                {item.body && (
                  <span className="mt-2.5 block text-sm text-muted">{item.body}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
