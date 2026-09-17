import Link from "next/link";
import { fetchSiteChrome } from "@/lib/content/site-source";

/**
 * Server component. Dropdowns open on :hover and :focus-within in CSS; the
 * mobile panel is a native <details>. No JavaScript, no nav library.
 *
 * The header sits in normal flow, ABOVE the hero. The approved design has the
 * map starting at y=116 with the nav occupying 0..86 — they never overlap.
 * An earlier absolute version covered the top of every page that was not the
 * homepage; do not reintroduce it.
 *
 * ASYNC because the menu comes from the CMS. This runs on every page, so the
 * fetch is deliberately one call for nav, footer and certifications together
 * — and Next memoises it, so the header and footer on the same page share it.
 */
export async function SiteHeader() {
  const { nav, headerCta } = await fetchSiteChrome();

  return (
    <header className="relative z-30">
      <div className="flex items-center justify-between gap-8 px-gutter py-5">
        <Link
          href="/"
          className="text-[1.375rem] font-bold tracking-[-0.03em] text-deep"
        >
          genedrift
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex gap-7.5">
            {nav.map((item) => (
              <li key={item.href} className="nav-item relative">
                <Link
                  href={item.href}
                  className="block py-2 text-md font-medium text-mid transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>

                {item.children && (
                  <div className="nav-panel absolute top-full left-1/2 z-40 w-64 -translate-x-1/2 pt-2">
                    <ul className="rounded-panel border border-line bg-canvas p-2 shadow-card">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-control px-3.5 py-2.5 text-sm text-mid transition-colors hover:bg-lavender hover:text-accent"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4.5">
          <Link
            href="/search"
            aria-label="Search the site"
            className="flex size-9.5 items-center justify-center rounded-pill text-muted transition-colors hover:bg-lavender hover:text-accent"
          >
            <svg
              aria-hidden
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.8-3.8" />
            </svg>
          </Link>

          <Link
            href={headerCta.href}
            className="hidden rounded-control bg-accent px-5 py-2.75 text-sm font-semibold text-on-accent transition-colors hover:bg-deep sm:block"
          >
            {headerCta.label}
          </Link>

          {/* Mobile toggle — native <details>, no JS */}
          <details className="mobile-nav lg:hidden">
            <summary
              aria-label="Menu"
              className="flex size-9.5 cursor-pointer items-center justify-center rounded-pill text-deep transition-colors hover:bg-lavender"
            >
              <svg className="mobile-nav-open" aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
              <svg className="mobile-nav-close" aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </summary>

            <nav
              aria-label="Main"
              className="absolute inset-x-0 top-full z-40 max-h-[80vh] overflow-y-auto border-y border-line bg-canvas px-gutter pt-4 pb-8"
            >
              <ul className="divide-y divide-hair">
                {nav.map((item) => (
                  <li key={item.href} className="py-3">
                    <Link href={item.href} className="block text-h4 font-bold text-ink">
                      {item.label}
                    </Link>
                    {item.children && (
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link href={child.href} className="text-sm text-muted">
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>

              <Link
                href={headerCta.href}
                className="mt-6 block rounded-control bg-accent px-6 py-3.5 text-center text-body font-semibold text-on-accent"
              >
                {headerCta.label}
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
