import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/sections/page-head";
import { CONTACT_INTENTS, INTENTS } from "@/lib/forms/contact";

export const metadata: Metadata = {
  title: "Contact — Genedrift",
  description: "Speak to a regulatory lead, request a proposal, or report a safety concern.",
};

export default function ContactHub() {
  return (
    <main className="pb-section">
      <PageHead
        type="page-head"
        eyebrow="Contact"
        heading="Tell us the product and the market."
        headingTail="We'll route you to the right team."
        actions={[]}
      />

      <section className="px-gutter pt-11">
        <div className="mx-auto grid max-w-body gap-px border border-line bg-line sm:grid-cols-2">
          {CONTACT_INTENTS.map((slug) => {
            const intent = INTENTS[slug];
            return (
              <Link
                key={slug}
                href={`/contact/${slug}`}
                className="group flex h-full flex-col bg-canvas px-7.5 pt-7 pb-8 transition-colors hover:bg-lavender"
              >
                <span className="label text-accent">{intent.eyebrow}</span>
                <span className="mt-4 block text-h4 font-bold group-hover:text-accent">
                  {intent.heading}
                </span>
                <span className="mt-3 block text-sm text-muted">{intent.standfirst}</span>
                {!intent.enabled && (
                  <span className="label mt-5 text-faint">Not yet live — see the page</span>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
