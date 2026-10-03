import type { MetadataRoute } from "next";
import { SITE_INDEXABLE } from "./robots";
import { PILLARS, detailRoutes, jobRoutes, marketRoutes, regionRoutes } from "@/lib/content/pages";
import { getCaseStudies } from "@/lib/content/case-studies-source";
import { hasDetail } from "@/lib/content/case-study";
import { fetchDiscoverableArticles } from "@/lib/content/articles-source";

/**
 * /sitemap.xml, referenced from robots.txt once the site is indexable.
 *
 * Built from the same sources the pages render from, so a market, case study,
 * job or article added in the CMS appears here without a code change.
 * Articles come from Catalyst's discoverable list, which already leaves out
 * anything the editor marked "Noindex" and anything withdrawn.
 *
 * Before launch (SITE_INDEXABLE off) it is empty, so a staging domain never
 * hands search engines a list of its pages.
 *
 * Country service pages are left out while that feature is on hold.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!SITE_INDEXABLE) return [];
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.genedrift.com").replace(/\/$/, "");
  const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    ...(lastModified ? { lastModified } : {}),
  });

  const fixed = ["/", "/insights", "/markets", "/global-presence", "/careers", "/contact", "/client-success/case-studies"];

  const [regions, markets, jobs, studies, articles] = await Promise.all([
    regionRoutes().catch(() => []),
    marketRoutes().catch(() => []),
    jobRoutes().catch(() => []),
    getCaseStudies().catch(() => []),
    fetchDiscoverableArticles().catch(() => []),
  ]);

  const paths = new Set<string>(fixed);
  for (const pillar of PILLARS) paths.add(`/${pillar}`);
  for (const { pillar, slug } of detailRoutes()) paths.add(`/${pillar}/${slug}`);
  for (const r of regions) paths.add(`/markets/${r.region}`);
  for (const m of markets) paths.add(`/markets/${m.region}/${m.country}`);
  for (const j of jobs) paths.add(`/careers/${j.job}`);
  for (const s of studies) if (hasDetail(s)) paths.add(`/client-success/case-studies/${s.slug}`);

  return [
    ...[...paths].map((p) => entry(p)),
    ...articles.map((a) => entry(`/insights/${a.slug}`, a.publishedAt)),
  ];
}
