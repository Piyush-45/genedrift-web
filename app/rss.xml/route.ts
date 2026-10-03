import { fetchDiscoverableArticles } from "@/lib/content/articles-source";

/**
 * /rss.xml — the 50 newest indexable articles, for feed readers, LinkedIn
 * schedulers and newsletter tools. Same source as the sitemap, so a withdrawn
 * or "Noindex" article never appears.
 */
export const revalidate = 3600;

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.genedrift.com").replace(/\/$/, "");
  const articles = (await fetchDiscoverableArticles().catch(() => []))
    .filter((a) => a.slug && a.publishedAt)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 50);

  const items = articles
    .map((a) => {
      const link = `${base}/insights/${a.slug}`;
      const date = new Date(a.publishedAt);
      return [
        "<item>",
        `<title>${xml(a.title)}</title>`,
        `<link>${xml(link)}</link>`,
        `<guid isPermaLink="true">${xml(link)}</guid>`,
        Number.isNaN(date.getTime()) ? "" : `<pubDate>${date.toUTCString()}</pubDate>`,
        a.primaryCategory ? `<category>${xml(a.primaryCategory)}</category>` : "",
        `<description>${xml(a.excerpt)}</description>`,
        "</item>",
      ].join("");
    })
    .join("");

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>` +
    `<title>Genedrift Knowledge Hub</title>` +
    `<link>${xml(`${base}/insights`)}</link>` +
    `<atom:link href="${xml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml"/>` +
    `<description>Regulatory insight from Genedrift</description>` +
    `<language>en</language>` +
    items +
    `</channel></rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=3600",
    },
  });
}
