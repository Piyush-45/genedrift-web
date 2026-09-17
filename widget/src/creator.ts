import type { PageRecord, SectionRecord } from "./types";

/**
 * Everything that talks to Zoho Creator. The rest of the widget never sees the
 * SDK, a report name, or a Creator field name — which is what makes the UI
 * testable and the field names changeable in one place.
 *
 * Report names follow the same convention as the editorial app
 * (`Articles_Report`), so a form called `Website_Pages` gets
 * `Website_Pages_Report`. If yours were named differently, change them here
 * and nowhere else.
 */
const REPORTS = {
  pages: "Website_Pages_Report",
  sections: "Website_Sections_Report",
} as const;

/** Creator returns these codes when a report simply has no rows. Not errors. */
const NO_RECORDS = new Set([9220, 9280]);

function sdk(): ZohoCreatorSdk {
  const creator = window.ZOHO?.CREATOR;
  if (!creator) {
    throw new Error(
      "The Zoho Creator SDK is not available. Open this page from inside the Creator application, not as a standalone URL.",
    );
  }
  return creator;
}

/**
 * The SDK is loaded by main.tsx before this module is imported. There is no
 * `init()` call — the V2 SDK exposes DATA and UTIL directly, and calling
 * `init()` is what produced "init is not a function" on the first attempt.
 */
export async function initCreator(): Promise<void> {
  if (!window.ZOHO?.CREATOR?.DATA) {
    throw new Error("The Zoho Creator SDK loaded but exposes no DATA API. Reload the page.");
  }
}

/**
 * The application's link name, as it appears in a Creator URL.
 * `creatorapp.zoho.in/<workspace>/genedrift-website`
 */
const APP_SLUG = "genedrift-website";

/**
 * The Creator account that owns this application.
 *
 * ⚠️ CHANGE THIS AT HANDOVER. When the app moves to the client's own Zoho
 * account this constant, and nothing else in the widget, has to change.
 */
const FALLBACK_WORKSPACE = "piyugene02";

/**
 * Work out which Creator account this widget is running in.
 *
 * `invokeCustomApi` needs it and the SDK does not supply it.
 *
 * The naive version of this — "take the first path segment" — resolved to
 * `index.html`, because a widget runs in its own iframe whose URL is the
 * widget's own asset path, not the application's. So every candidate URL is
 * checked for the APP SLUG and the workspace is read from beside it. That is
 * the shape the editorial widget uses, and it is the reason it works.
 *
 * Three URL shapes Creator produces:
 *   /<workspace>/genedrift-website                    the live application
 *   /preview/<workspace>/…                            the page builder
 *   /appbuilder/<workspace>/genedrift-website/…       the editor
 */
function workspaceName(): string {
  for (const candidate of [document.referrer, window.location.href]) {
    try {
      const segments = new URL(candidate).pathname.split("/").filter(Boolean);

      if (segments[0] === "preview") {
        if (segments[1]) return segments[1];
        continue;
      }
      if (segments[0] === "appbuilder") {
        if (segments[1] && segments[2] === APP_SLUG) return segments[1];
        continue;
      }
      if (segments[1] === APP_SLUG && segments[0]) return segments[0];
      if (segments[1] === "environment" && segments.includes(APP_SLUG) && segments[0]) {
        return segments[0];
      }
    } catch {
      // Not a URL that can be parsed — try the next candidate.
    }
  }
  return FALLBACK_WORKSPACE;
}

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    // A lookup field arrives as { ID, display_value }.
    const row = value as Record<string, unknown>;
    return String(row.ID ?? row.display_value ?? "");
  }
  return String(value);
}

function truthy(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  return ["true", "yes", "1"].includes(String(value).trim().toLowerCase());
}

/**
 * Turn whatever Creator rejected with into a sentence.
 *
 * The SDK rejects with a PLAIN OBJECT, not an Error. `String(thatObject)` is
 * `"[object Object]"` — which is exactly what an empty report showed on screen
 * instead of the reason. Anything that reports an error to a person has to
 * handle the non-Error case.
 */
export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const row = error as { message?: unknown; code?: unknown; description?: unknown };
    const parts = [row.message ?? row.description, row.code ? `(code ${String(row.code)})` : ""]
      .filter(Boolean)
      .map(String);
    if (parts.length > 0) return parts.join(" ");
    try {
      return JSON.stringify(error).slice(0, 400);
    } catch {
      return "An error with no readable message.";
    }
  }
  return String(error);
}

/** Codes meaning "this report has no rows", which is not a failure. */
function isNoRecords(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const code = Number(
    typeof value === "object" ? (value as { code?: unknown }).code : value,
  );
  return NO_RECORDS.has(code);
}

async function getAll(reportName: string, operation: string): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let cursor: string | undefined;
  const seenCursors = new Set<string>();

  do {
    let response;
    try {
      response = await sdk().DATA.getRecords({
        report_name: reportName,
        max_records: 1000,
        ...(cursor ? { record_cursor: cursor } : {}),
      });
    } catch (error) {
      // An EMPTY REPORT is rejected, not resolved. Creator throws
      // {code: 9280, …} rather than returning an empty list, so a widget that
      // only checks `response.code` shows an error for a form nobody has put
      // data in yet — which is the state every new form starts in.
      if (isNoRecords(error)) return rows;
      throw new Error(`${operation}: ${describeError(error)}`);
    }

    if (isNoRecords(response.code)) break;
    if (Number(response.code) !== 3000) {
      throw new Error(`${operation}: Creator returned ${response.code} ${response.message ?? ""}`.trim());
    }

    rows.push(...(response.data ?? []));
    cursor = response.record_cursor || undefined;

    // A repeated cursor means Creator is looping. Better to stop and say so
    // than to spin until the browser tab dies.
    if (cursor && seenCursors.has(cursor)) {
      throw new Error(`${operation}: Creator repeated a page cursor. Reload before trusting these results.`);
    }
    if (cursor) seenCursors.add(cursor);
  } while (cursor);

  return rows;
}

export async function loadPages(): Promise<PageRecord[]> {
  const rows = await getAll(REPORTS.pages, "Load pages");
  return rows
    .map((row) => ({
      id: text(row.ID),
      pageUuid: text(row.Page_UUID),
      path: text(row.Path),
      internalTitle: text(row.Internal_Title),
      status: text(row.Status),
      seoTitle: text(row.SEO_Title),
      seoDescription: text(row.SEO_Description),
      lastPublishedAt: text(row.Last_Published_At),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function loadSections(): Promise<SectionRecord[]> {
  const rows = await getAll(REPORTS.sections, "Load sections");

  return rows
    .map((row) => {
      const raw = text(row.Section_Data).trim();
      let data: Record<string, unknown> = {};
      let parseError: string | null = null;

      if (raw !== "") {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            data = parsed as Record<string, unknown>;
          } else {
            parseError = "Section data is not an object.";
          }
        } catch {
          // Never discard content we cannot read. `rawData` is kept and the UI
          // refuses to overwrite the field until someone looks at it.
          parseError = "Section data is not valid JSON and was not loaded.";
        }
      }

      return {
        id: text(row.ID),
        sectionUuid: text(row.Section_UUID),
        pageId: text(row.Page),
        displayOrder: Number(row.Display_Order ?? 0),
        sectionType: text(row.Section_Type),
        data,
        rawData: raw,
        parseError,
        hidden: truthy(row.Hidden),
        isRequired: truthy(row.Is_Required),
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveSectionData(
  sectionId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const response = await sdk().DATA.updateRecordById({
    report_name: REPORTS.sections,
    id: sectionId,
    payload: { data: { Section_Data: JSON.stringify(data) } },
  });
  if (Number(response.code) !== 3000) {
    throw new Error(`Save failed: Creator returned ${response.code} ${response.message ?? ""}`.trim());
  }
}

export async function savePageMeta(
  pageId: string,
  fields: { seoTitle: string; seoDescription: string; internalTitle: string },
): Promise<void> {
  const response = await sdk().DATA.updateRecordById({
    report_name: REPORTS.pages,
    id: pageId,
    payload: {
      data: {
        Internal_Title: fields.internalTitle,
        SEO_Title: fields.seoTitle,
        SEO_Description: fields.seoDescription,
      },
    },
  });
  if (Number(response.code) !== 3000) {
    throw new Error(`Save failed: Creator returned ${response.code} ${response.message ?? ""}`.trim());
  }
}

/**
 * Publish, by calling the Deluge function through a Creator Custom API.
 *
 * A widget cannot call a Deluge function directly — it has to be exposed as a
 * Custom API first. Until that is configured this throws a message that says
 * exactly what to do, rather than a raw Zoho error code.
 */
export async function publishPage(pageId: string): Promise<{ sectionCount: number }> {
  const workspace = workspaceName();
  let response: ZohoCustomApiResponse;

  try {
    response = await sdk().DATA.invokeCustomApi({
      // `api_name`, not `api_link_name`; `http_method`, not `method`. The SDK
      // rejects the wrong spellings with an unhelpful error.
      api_name: "publish_website_page",
      workspace_name: workspace,
      http_method: "POST",
      content_type: "application/json",
      payload: { pageId },
    });
  } catch (error) {
    /**
     * Report what actually failed.
     *
     * An earlier version caught everything here and said "Publishing is not
     * connected yet", on the assumption that a missing Custom API was the only
     * way this could fail. That assumption threw away the one piece of
     * information needed to fix anything else — and sent someone to check a
     * setting that was already correct.
     *
     * A catch-all that guesses the cause is worse than no catch at all.
     */
    const detail = describeError(error);
    throw new Error(
      `Publish call failed (workspace "${workspace}", API "publish_website_page"): ${detail}`,
    );
  }

  const result = (response.result ?? response.data ?? {}) as Record<string, unknown>;

  // Zoho signals its own failures through the response code, not by throwing.
  if (Number(response.code) !== 3000 && response.code !== undefined) {
    throw new Error(
      `Publish call returned code ${response.code}${response.message ? `: ${response.message}` : ""}. ` +
        `Check the Custom API exists in workspace "${workspace}" with the link name publish_website_page.`,
    );
  }

  if (result.ok !== true) {
    throw new Error(
      String(result.message ?? `Publish was refused. Raw response: ${JSON.stringify(response).slice(0, 400)}`),
    );
  }

  return { sectionCount: Number(result.sectionCount ?? 0) };
}
