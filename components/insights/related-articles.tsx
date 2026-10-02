import Link from "next/link";
import type { Article } from "@/lib/content/article";
import { fetchArticles } from "@/lib/content/articles-source";
import { ArticleCard } from "./article-card";

/**
 * "Keep reading": up to three other articles, same category first, topped up
 * with the latest. Never the article being read. Renders nothing when there
 * is nothing else published.
 */
export async function RelatedArticles({ article }: { article: Article }) {
  const picked: Article[] = [];
  const add = (list: Article[]) => {
    for (const a of list) {
      if (picked.length >= 3) return;
      if (a.uuid !== article.uuid && !picked.some((p) => p.uuid === a.uuid)) picked.push(a);
    }
  };

  if (article.category?.name) add((await fetchArticles({ category: article.category.name, limit: 4 })).articles);
  if (picked.length < 3) add((await fetchArticles({ limit: 6 })).articles);
  if (picked.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="label text-accent">Keep reading</p>
            <h2 className="mt-4 text-h2 font-bold">More from the Knowledge Hub.</h2>
          </div>
          <Link href="/insights" className="hidden text-md font-semibold text-accent hover:text-deep sm:block">
            All insights →
          </Link>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {picked.map((a) => (
            <li key={a.uuid}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
