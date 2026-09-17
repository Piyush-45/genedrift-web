import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleHead } from "@/components/sections/article-head";
import { ArticleBody } from "@/components/sections/article-body";
import { PageHead } from "@/components/sections/page-head";
import { ContactSplit } from "@/components/sections/contact-split";
import { contactSplitFixture } from "@/components/sections/contact-split/fixture";
import {
  API_MAX_LIMIT,
  allArticles,
  fetchArticle,
  fetchArticles,
} from "@/lib/content/articles-source";
import { isCatalystConfigured } from "@/lib/content/catalyst";

/**
 * Template F — one article, at /insights/{slug}.
 *
 * This was briefly a catch-all (`[...slug]`) so it could serve both
 * `/insights/{slug}` and `/insights/{content-type}/{slug}` while that decision
 * was open. A single segment is used instead because it is simpler and
 * expresses the URL we actually serve today.
 *
 * (For the record, so nobody re-litigates it: the catch-all was ALSO suspected
 * of causing the `NoFallbackError` log noise. It was not. Measured on Next
 * 16.3.3, every 404 logs that internally — including `/nope`, which touches no
 * dynamic route at all. It is a Next internal, not something this routing
 * causes. What the catch-all DID cause, with `dynamicParams = false`, was a
 * genuine ERR_TOO_MANY_REDIRECTS on unknown paths.)
 *
 * The flexibility is not lost — it moved. If the client adopts
 * `/insights/{content-type}/{slug}`, flip `URL_INCLUDES_CONTENT_TYPE` in
 * lib/content/article.ts and add ONE route file, `[type]/[slug]/page.tsx`,
 * that calls the same helpers. Every link, sitemap entry and param already
 * derives from `articleHref()` / `articleParams()`.
 */
/**
 * `dynamicParams` is TRUE (the default) once the API is live: articles are
 * published continuously, and prerendering only the slugs known at build time
 * would 404 every article published since the last deploy.
 */
export const dynamicParams = true;

/**
 * Prerender the slugs the API knows about at build time. With the API
 * unconfigured this falls back to the fixtures, so `npm run build` still works
 * offline. `dynamicParams` above covers everything published after the build.
 */
export async function generateStaticParams() {
  if (!isCatalystConfigured()) return allArticles().map((a) => ({ slug: a.slug }));
  const { articles } = await fetchArticles({ limit: API_MAX_LIMIT });
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchArticle(slug);
  if (result.state !== "ok") {
    return {
      title: result.state === "gone" ? "Article withdrawn — Genedrift" : "Knowledge Hub — Genedrift",
      robots: { index: false, follow: true },
    };
  }
  const { article } = result;
  return {
    title: article.seoTitle ?? `${article.title} — Genedrift`,
    description: article.seoDescription ?? article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await fetchArticle(slug);

  /* A RETRACTED article returns 410, not 404, and must not be treated as
     "never existed". On a regulatory site the difference is the point: someone
     following a link to a withdrawn notice needs to be told it was withdrawn,
     not shown a generic not-found page that implies they misremembered. */
  if (result.state === "gone") {
    /* Catalyst returns the retraction reason and a replacement path with the
       410, so say what happened and point at whatever superseded it. On a
       regulatory site that is the difference between "we withdrew this, here
       is the current position" and a dead end. */
    return (
      <main className="pb-section">
        <PageHead
          type="page-head"
          eyebrow="Withdrawn"
          heading="This article has been withdrawn."
          standfirst={
            result.reason?.trim() ||
            "It is no longer published. If you were relying on it, please get in touch and we will point you to the current position."
          }
          actions={[
            result.replacementPath
              ? { label: "Read the current version", href: result.replacementPath, variant: "solid" as const }
              : { label: "Speak to an Expert", href: "/contact/enquiry", variant: "solid" as const },
            { label: "All insights", href: "/insights", variant: "quiet" as const },
          ]}
        />
      </main>
    );
  }

  if (result.state === "missing") notFound();
  const { article } = result;

  return (
    <main className="pb-section">
      <ArticleHead
        type="article-head"
        articleSlug={article.slug}
        backLabel="← All insights"
        backHref="/insights"
        article={article}
      />
      <ArticleBody type="article-body" articleSlug={article.slug} article={article} />
      <ContactSplit {...contactSplitFixture} />
    </main>
  );
}
