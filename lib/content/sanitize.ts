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

/**
 * Rich text from the client's Creator form, reduced to plain lines.
 *
 * `Job_Profile` on their Openings form is a rich-text field, and what it holds
 * is pasted Google Docs markup — every `<li>` carries an inline
 * `font-family: Carlito` and a hardcoded colour. Rendering that HTML would put
 * a Google font and a black that is not our black on a page built entirely
 * from `styles/tokens.css`.
 *
 * So the markup is sanitised (which strips every style attribute, since the
 * allowlist above permits none) and then reduced to the text of each list item
 * or paragraph. The website re-renders those in its own list styles. Structure
 * is kept; their formatting is not.
 */
/**
 * HTML entities in a field that is supposed to be PLAIN text.
 *
 * Their `Job_Description1` is a plain-text field, but the copy pasted into it
 * came from a rich editor, so it carries `&nbsp;`, `&amp;` and `&#39;` as
 * literal characters. Those render as the words themselves on a public page —
 * "filings with HA in emerging markets.&nbsp;Attend Pre-Submission meetings".
 *
 * A non-breaking space becomes a normal space rather than U+00A0, because the
 * separator is doing the job of a paragraph break in their copy and needs to
 * be splittable.
 */
export function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/gi, "\u2019")
    .replace(/&lsquo;/gi, "\u2018")
    .replace(/&ldquo;/gi, "\u201c")
    .replace(/&rdquo;/gi, "\u201d")
    .replace(/&ndash;/gi, "\u2013")
    .replace(/&mdash;/gi, "\u2014")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    // Last, so an escaped entity such as &amp;nbsp; does not become a tag.
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

/**
 * One unbroken block of prose, split into sentences.
 *
 * Their descriptions are inconsistent: some use blank lines between
 * paragraphs, some run every sentence together separated only by `&nbsp;`.
 * The second kind renders as a twenty-line wall that nobody reads, so it is
 * broken into sentences and shown as a list — the same shape the well-formed
 * records already have.
 *
 * Abbreviations are the trap: "i.e. CTD Modules" must not become two bullets.
 * The lookbehind therefore refuses to split after a known abbreviation, and
 * any fragment too short to be a sentence is folded back into the one before.
 */
const ABBREVIATIONS = /(?:i\.e|e\.g|etc|vs|Dr|Mr|Mrs|Ms|No|approx|Inc|Ltd)\.$/i;

export function sentencesOf(text: string, minLength = 25): string[] {
  const parts = text
    // Their copy also runs sentences together with NO space at all —
    // "…for various markets.Adequacy Review and Gap Analysis…". A space is
    // inserted where a full stop sits between a lower-case character and a
    // capital, which is a sentence boundary and never a decimal or an
    // abbreviation.
    .replace(/(?<=[a-z0-9)])\.(?=[A-Z])/g, ". ")
    .split(/(?<=[.;:!?])\s+(?=[A-Z0-9])/);
  const out: string[] = [];

  for (const part of parts) {
    const piece = part.trim();
    if (!piece) continue;
    const previous = out[out.length - 1];
    // Joined back on when the break was an abbreviation, or when the fragment
    // is too short to stand on its own as a bullet.
    if (previous && (ABBREVIATIONS.test(previous) || piece.length < minLength)) {
      out[out.length - 1] = `${previous} ${piece}`;
    } else {
      out.push(piece);
    }
  }
  return out;
}

export function richTextToLines(html: string): string[] {
  if (!html.trim()) return [];

  const clean = sanitizeHtml(html, {
    allowedTags: ["p", "ul", "ol", "li", "br", "strong", "b", "em", "i"],
    allowedAttributes: {},
  });

  // Block boundaries become newlines, then each becomes one line.
  const text = clean
    .replace(/<\/(p|li|ul|ol)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return text
    .split("\n")
    // Zero-width spaces are all through their copy — they survive .trim()
    // and turn an empty line into a line one character long.
    .map((line) => line.replace(/​/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim())
    .filter((line) => line !== "");
}

/**
 * The same reduction for a PLAIN-TEXT field that uses newlines as its only
 * structure — `Candidate_Profile` on their form.
 */
export function plainTextToLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/​/g, "").replace(/\s+/g, " ").trim())
    .filter((line) => line !== "");
}
