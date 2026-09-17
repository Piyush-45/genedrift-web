import Link from "next/link";
import { fetchSiteChrome, footerColumns } from "@/lib/content/site-source";

/**
 * The link columns are DERIVED from the menu — any item with children becomes
 * a column — so the header and footer cannot drift out of step. Renaming a
 * menu item renames its footer column, once.
 *
 * The certification row is filtered by expiry in `site-source.ts`: a lapsed
 * certificate stops being claimed rather than sitting in the footer for years.
 */
export async function SiteFooter() {
  const { nav, legal, footer, certifications } = await fetchSiteChrome();
  const columns = footerColumns(nav);

  return (
    <footer className="bg-deep px-gutter pt-18 pb-8.5 text-on-deep">
      <div className="mx-auto max-w-body">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
          <div className="lg:w-75 lg:shrink-0">
            <Link href="/" className="text-[1.375rem] font-bold tracking-[-0.03em]">
              genedrift
            </Link>
            <p className="mt-3.5 text-md leading-[1.6] text-on-deep-muted">
              {footer.tagline}
              <br />
              {footer.description}
            </p>
            <address className="mt-5 text-md leading-[1.8] text-on-deep-muted not-italic">
              {footer.site}
              <br />
              <a href={`mailto:${footer.email}`} className="hover:text-on-deep">
                {footer.email}
              </a>
              <br />
              {footer.address}
            </address>
          </div>

          <nav
            aria-label="Footer"
            className="grid grow grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-5"
          >
            {columns.map((column) => (
              <div key={column.href}>
                <p className="label">{column.label}</p>
                <ul className="mt-3.5 space-y-0.5 text-sm leading-[2] text-on-deep-muted">
                  {column.children?.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} className="transition-colors hover:text-on-deep">
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12.5 flex flex-col gap-4 border-t border-on-deep/15 pt-5.5 text-xs text-on-deep-faint lg:flex-row lg:items-center lg:justify-between">
          <span>© {new Date().getFullYear()} Genedrift. All rights reserved.</span>

          {/* Certification claims — see the warning in lib/nav.ts. */}
          <ul className="flex flex-wrap gap-x-6.5 gap-y-2">
            {certifications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <ul className="flex flex-wrap gap-x-6.5 gap-y-2">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-on-deep">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
