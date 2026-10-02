/**
 * "On this page" support for the reading page.
 *
 * Runs on HTML that has ALREADY been through sanitizeArticleHtml(), which
 * strips every attribute from headings. So each <h2> here is a bare tag, and
 * the only id it can end up with is the one generated below from its own
 * text: nothing from the editor or the API reaches the attribute.
 */
export interface TocEntry {
  id: string;
  text: string;
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

export function headingText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

/** Adds ids to every <h2> and returns the list for the contents rail. */
export function withHeadingIds(sanitizedHtml: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const used = new Map<string, number>();

  const html = sanitizedHtml.replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner: string) => {
    const text = headingText(inner);
    if (!text) return `<h2>${inner}</h2>`;
    const base = slugifyHeading(text);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n === 0 ? base : `${base}-${n + 1}`;
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return { html, toc };
}
