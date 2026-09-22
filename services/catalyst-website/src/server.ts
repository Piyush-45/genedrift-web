import express from "express";
import catalyst from "zcatalyst-sdk-node";
import { loadEnvironment } from "./config";
import { publishRequestSchema, unpublishRequestSchema, pathSchema } from "./domain";
import { AuthError, verifyRequestSignature } from "./security";
import {
  CaseStudiesService,
  DuplicateCaseStudyError,
  DuplicateMarketError,
  DuplicateNavKeyError,
  EmptyNavigationError,
  MarketsService,
  PublishingService,
  SiteService,
} from "./service";
import { marketsPublishRequestSchema } from "./markets";
import { caseStudiesPublishRequestSchema } from "./case-studies";
import { sitePublishRequestSchema } from "./site";
import { Store, isTombstone } from "./store";
import { createLocalBucket } from "./local-bucket";

const env = loadEnvironment();
const app = express();

app.disable("x-powered-by");

/**
 * The raw body is needed for signature verification, so it is captured before
 * anything parses it. Verifying a signature against a re-serialised body is a
 * classic way to get intermittent 401s: JSON.stringify does not always
 * reproduce the exact bytes that were signed.
 */
app.use(
  express.raw({ type: "*/*", limit: env.MAX_PAYLOAD_BYTES }),
);

function storeFor(req: express.Request): Store {
  // Local development only — see local-bucket.ts. Not set on AppSail.
  const localDir = process.env.LOCAL_STORE_DIR;
  if (localDir) return new Store(createLocalBucket(localDir) as never);

  const appInstance = catalyst.initialize(req as never) as unknown as {
    stratus(): { bucket(name: string): never };
  };
  return new Store(appInstance.stratus().bucket(env.CATALYST_STRATUS_PRIVATE_BUCKET));
}

function rawBody(req: express.Request): Buffer {
  return Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
}

function requireSignature(req: express.Request): void {
  verifyRequestSignature(
    env.WEBSITE_HMAC_SECRET,
    req.method,
    req.path,
    rawBody(req),
    {
      // Same header names as the editorial publisher. One signing convention
      // across both services means one thing for the team to learn, and the
      // Deluge that signs a publish is copy-shaped between them.
      timestamp: req.header("X-GeneDrift-Timestamp") ?? undefined,
      nonce: req.header("X-GeneDrift-Nonce") ?? undefined,
      signature: req.header("X-GeneDrift-Signature") ?? undefined,
    },
    new Date(),
    env.REQUEST_CLOCK_SKEW_SECONDS,
  );
}

function parseJsonBody(req: express.Request): unknown {
  const raw = rawBody(req).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

/**
 * The path arrives as everything after /v1/public/pages.
 *
 * THE HOMEPAGE IS `_root`, NOT AN EMPTY SEGMENT. Express treats a trailing
 * slash as optional by default, so `/v1/public/pages/` matches the INDEX route
 * registered above rather than this one — the caller silently receives the
 * list of live paths instead of the home page. That failed quietly: the
 * website saw no `page` in the response and fell back to its built-in copy, so
 * publishing the homepage appeared to do nothing at all.
 *
 * `_root` is the same spelling the storage layer already uses for the home
 * page's object key, so there is one convention rather than two.
 *
 * An empty segment is still accepted, for anything that already calls it that
 * way.
 */
function pathFromRequest(req: express.Request): string {
  const suffix = (req.params[0] ?? "").replace(/^\/+|\/+$/g, "");
  return suffix === "" || suffix === "_root" ? "/" : `/${suffix}`;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "genedrift-website-publishing" });
});

/* ---------------------------------------------------------------- write --- */

app.post("/v1/website/publications", async (req, res) => {
  try {
    requireSignature(req);
    const parsed = publishRequestSchema.safeParse(parseJsonBody(req));
    if (!parsed.success) {
      // Say WHICH field and WHY. "Invalid request" costs a round trip every
      // time someone mistypes a section type.
      return res.status(422).json({
        ok: false,
        code: "PUBLICATION_INVALID",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const service = new PublishingService(storeFor(req));
    const doc = await service.publish(parsed.data, new Date());

    return res.status(201).json({
      ok: true,
      publicationId: doc.publicationId,
      path: doc.page.path,
      contentHash: doc.contentHash,
      publishedAt: doc.publishedAt,
      sectionCount: doc.sections.length,
    });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/v1/website/unpublish", async (req, res) => {
  try {
    requireSignature(req);
    const parsed = unpublishRequestSchema.safeParse(parseJsonBody(req));
    if (!parsed.success) {
      return res.status(422).json({ ok: false, code: "REQUEST_INVALID" });
    }
    const service = new PublishingService(storeFor(req));
    await service.unpublish(parsed.data.path, parsed.data.reason ?? null, new Date());
    return res.json({ ok: true, path: parsed.data.path });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/v1/website/rollback", async (req, res) => {
  try {
    requireSignature(req);
    const body = parseJsonBody(req) as { path?: unknown; publicationId?: unknown };
    const path = pathSchema.safeParse(body.path);
    if (!path.success || typeof body.publicationId !== "string") {
      return res.status(422).json({ ok: false, code: "REQUEST_INVALID" });
    }
    const service = new PublishingService(storeFor(req));
    const doc = await service.rollback(path.data, body.publicationId);
    if (!doc) return res.status(404).json({ ok: false, code: "PUBLICATION_NOT_FOUND" });
    return res.json({ ok: true, publicationId: doc.publicationId, path: doc.page.path });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/v1/website/markets", async (req, res) => {
  try {
    requireSignature(req);
    const parsed = marketsPublishRequestSchema.safeParse(parseJsonBody(req));
    if (!parsed.success) {
      return res.status(422).json({
        ok: false,
        code: "MARKETS_INVALID",
        issues: parsed.error.issues.slice(0, 20).map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const service = new MarketsService(storeFor(req));
    const doc = await service.publish(parsed.data, new Date());

    return res.status(201).json({
      ok: true,
      publicationId: doc.publicationId,
      contentHash: doc.contentHash,
      publishedAt: doc.publishedAt,
      marketCount: doc.markets.length,
      regionCount: doc.regions.length,
    });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/v1/website/markets/rollback", async (req, res) => {
  try {
    requireSignature(req);
    const body = parseJsonBody(req) as { publicationId?: unknown };
    if (typeof body.publicationId !== "string") {
      return res.status(422).json({ ok: false, code: "REQUEST_INVALID" });
    }
    const doc = await new MarketsService(storeFor(req)).rollback(body.publicationId);
    if (!doc) return res.status(404).json({ ok: false, code: "PUBLICATION_NOT_FOUND" });
    return res.json({ ok: true, publicationId: doc.publicationId, marketCount: doc.markets.length });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/v1/website/case-studies", async (req, res) => {
  try {
    requireSignature(req);
    const parsed = caseStudiesPublishRequestSchema.safeParse(parseJsonBody(req));
    if (!parsed.success) {
      return res.status(422).json({
        ok: false,
        code: "CASE_STUDIES_INVALID",
        issues: parsed.error.issues.slice(0, 20).map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const doc = await new CaseStudiesService(storeFor(req)).publish(parsed.data, new Date());

    return res.status(201).json({
      ok: true,
      publicationId: doc.publicationId,
      contentHash: doc.contentHash,
      publishedAt: doc.publishedAt,
      caseStudyCount: doc.caseStudies.length,
    });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/v1/website/case-studies/rollback", async (req, res) => {
  try {
    requireSignature(req);
    const body = parseJsonBody(req) as { publicationId?: unknown };
    if (typeof body.publicationId !== "string") {
      return res.status(422).json({ ok: false, code: "REQUEST_INVALID" });
    }
    const doc = await new CaseStudiesService(storeFor(req)).rollback(body.publicationId);
    if (!doc) return res.status(404).json({ ok: false, code: "PUBLICATION_NOT_FOUND" });
    return res.json({
      ok: true,
      publicationId: doc.publicationId,
      caseStudyCount: doc.caseStudies.length,
    });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/v1/website/site", async (req, res) => {
  try {
    requireSignature(req);
    const parsed = sitePublishRequestSchema.safeParse(parseJsonBody(req));
    if (!parsed.success) {
      return res.status(422).json({
        ok: false,
        code: "SITE_INVALID",
        issues: parsed.error.issues.slice(0, 20).map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const doc = await new SiteService(storeFor(req)).publish(parsed.data, new Date());
    return res.status(201).json({
      ok: true,
      publicationId: doc.publicationId,
      publishedAt: doc.publishedAt,
      menuCount: doc.nav.length,
      legalCount: doc.legal.length,
      certificationCount: doc.certifications.length,
    });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/v1/website/site/rollback", async (req, res) => {
  try {
    requireSignature(req);
    const body = parseJsonBody(req) as { publicationId?: unknown };
    if (typeof body.publicationId !== "string") {
      return res.status(422).json({ ok: false, code: "REQUEST_INVALID" });
    }
    const doc = await new SiteService(storeFor(req)).rollback(body.publicationId);
    if (!doc) return res.status(404).json({ ok: false, code: "PUBLICATION_NOT_FOUND" });
    return res.json({ ok: true, publicationId: doc.publicationId });
  } catch (error) {
    return handleError(res, error);
  }
});

/* ----------------------------------------------------------------- read --- */

app.get("/v1/public/pages", async (req, res) => {
  try {
    return res.json({ ok: true, pages: await storeFor(req).listLive() });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * The whole Markets collection in one response.
 *
 * ONE request, not 46. The website needs every market to draw the map and the
 * directory, so paginating this would only mean the site makes 46 requests to
 * rebuild something it always wants whole. It is roughly 20KB.
 *
 * A 404 here is NOT an error on the website's side: it means markets have
 * never been published, and the site falls back to its built-in copy.
 */
/**
 * Navigation, footer and certifications, in one response.
 *
 * Every page on the site renders all three, so this is fetched once per
 * render pass and cached like any other content. A 404 means it has never
 * been published, and the site falls back to its built-in menu.
 */
app.get("/v1/public/site", async (req, res) => {
  try {
    const doc = await new SiteService(storeFor(req)).getLive();
    if (!doc) return res.status(404).json({ ok: false, code: "SITE_NOT_PUBLISHED" });
    res.setHeader("cache-control", "public, max-age=60, stale-while-revalidate=600");
    return res.json({ ok: true, site: doc });
  } catch (error) {
    return handleError(res, error);
  }
});

app.get("/v1/public/markets", async (req, res) => {
  try {
    const doc = await new MarketsService(storeFor(req)).getLive();
    if (!doc) return res.status(404).json({ ok: false, code: "MARKETS_NOT_PUBLISHED" });
    res.setHeader("cache-control", "public, max-age=60, stale-while-revalidate=600");
    return res.json({ ok: true, markets: doc });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * The whole Case Studies collection in one response.
 *
 * A 404 is NOT an error on the website's side: it means case studies have
 * never been published, and the site renders its built-in copy.
 */
app.get("/v1/public/case-studies", async (req, res) => {
  try {
    const doc = await new CaseStudiesService(storeFor(req)).getLive();
    if (!doc) return res.status(404).json({ ok: false, code: "CASE_STUDIES_NOT_PUBLISHED" });
    res.setHeader("cache-control", "public, max-age=60, stale-while-revalidate=600");
    return res.json({ ok: true, caseStudies: doc });
  } catch (error) {
    return handleError(res, error);
  }
});

app.get(/^\/v1\/public\/pages\/(.*)$/, async (req, res) => {
  try {
    const path = pathFromRequest(req);
    const doc = await storeFor(req).getLive(path);

    if (!doc) return res.status(404).json({ ok: false, code: "PAGE_NOT_FOUND" });

    // 410, not 404: the page existed and was withdrawn. A search engine and a
    // person both deserve to be told the difference.
    if (isTombstone(doc)) {
      return res.status(410).json({
        ok: false,
        code: "PAGE_UNPUBLISHED",
        reason: doc.reason,
        unpublishedAt: doc.at,
      });
    }

    res.setHeader("cache-control", "public, max-age=60, stale-while-revalidate=600");
    return res.json({ ok: true, page: doc });
  } catch (error) {
    return handleError(res, error);
  }
});

/* ---------------------------------------------------------------- errors -- */

function handleError(res: express.Response, error: unknown): express.Response {
  if (error instanceof AuthError) {
    return res.status(401).json({ ok: false, code: error.code });
  }
  if (error instanceof DuplicateMarketError) {
    // 409, with the slug named. "Invalid" would send someone hunting through
    // 46 rows for a duplicate they cannot see.
    return res.status(409).json({
      ok: false,
      code: "MARKET_SLUG_DUPLICATE",
      message: error.message,
    });
  }
  if (error instanceof DuplicateCaseStudyError) {
    return res.status(409).json({
      ok: false,
      code: "CASE_STUDY_SLUG_DUPLICATE",
      message: error.message,
    });
  }
  if (error instanceof DuplicateNavKeyError) {
    return res.status(409).json({ ok: false, code: "NAV_KEY_DUPLICATE", message: error.message });
  }
  if (error instanceof EmptyNavigationError) {
    return res.status(422).json({ ok: false, code: "NAV_EMPTY", message: error.message });
  }
  if (error instanceof SyntaxError) {
    return res.status(400).json({ ok: false, code: "BODY_NOT_JSON" });
  }
  // Log the detail, return none. An error message from object storage can
  // carry bucket names and internal hostnames.
  console.error("[website-publishing]", error);
  return res.status(500).json({ ok: false, code: "INTERNAL_ERROR" });
}

app.listen(env.PORT, () => {
  console.log(`[website-publishing] listening on ${env.PORT}`);
});

export default app;
