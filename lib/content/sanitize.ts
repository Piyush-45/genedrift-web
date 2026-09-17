import sanitizeHtml from "sanitize-html";

/**
 * Second-layer sanitiser for article HTML.
 *
 * Catalyst already sanitises server-side during publish and only emits a
 * limited tag set. This is defence in depth, agreed with the platform
 * developer: on a pharmaceutical client's site, one sanitiser between an
 * editor's document and a public page is a single point of failure. Two
 * independent ones, with the second owned by the team that renders the output,
 * is cheap insurance.
 *
 * The allowlist below mirrors exactly what Catalyst says it emits. Anything
 * outside it is dropped rather than escaped, so a tag that appears here later
 * without warning simply does not render — it never executes.
 *
 * Runs on the SERVER only (article pages are server components), so the
 * library never reaches the browser bundle.
 */
const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "code",
  "hr",
  "br",
  "figure",
  "img",
  "figcaption",
];

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
    // Images come from the Catalyst/Stratus public host over HTTPS.
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    // Anything pointing off-site opens safely: noopener stops the new page
    // reaching back through window.opener.
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
    // Drop the contents of anything disallowed, rather than leaving stray text.
    nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  });
}
