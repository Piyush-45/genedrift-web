import Link from "next/link";
import { PageHead } from "@/components/sections/page-head";
import { NAV } from "@/lib/nav";

/**
 * The 404 page.
 *
 * Worth having for its own sake, but it also fixes a real symptom: without a
 * not-found boundary, `notFound()` inside the /insights catch-all left Next
 * with nothing to render, which it logged as an internal NoFallbackError on
 * every miss. A designed 404 is the fix, not a workaround.
 */
export default function NotFound() {
  return (
    <main className="pb-section">
      <PageHead
        type="page-head"
        eyebrow="404"
        heading="That page does not exist."
        headingTail="It may have moved, or the link may be wrong."
        standfirst="If you followed a link from elsewhere on this site, we would like to know."
        actions={[
          { label: "Speak to an Expert", href: "/contact/enquiry", variant: "solid" },
          { label: "Back to home", href: "/", variant: "quiet" },
        ]}
      />

      <section className="px-gutter pt-11">
        <div className="mx-auto max-w-body">
          <p className="label text-faint">Try one of these instead</p>
          <ul className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {NAV.map((item) => (
              <li key={item.href} className="bg-canvas">
                <Link
                  href={item.href}
                  className="block px-6 py-5 text-md font-semibold transition-colors hover:bg-lavender hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
