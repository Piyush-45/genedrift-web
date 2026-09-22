import type { PublishRequest, PublishedPage } from "./domain";
import {
  findDuplicateKey,
  legalLinks,
  nestNav,
  type SitePublishRequest,
  type PublishedSite,
} from "./site";
import {
  findDuplicateSlug,
  regionsFromMarkets,
  type MarketsPublishRequest,
  type PublishedMarkets,
} from "./markets";
import {
  findDuplicateSlug as findDuplicateCaseStudySlug,
  type CaseStudiesPublishRequest,
  type PublishedCaseStudies,
} from "./case-studies";
import { deterministicId, sha256Hex, stableJson } from "./security";
import type { Store } from "./store";

/**
 * Publish, unpublish, rollback. Everything the website CMS needs and nothing
 * more.
 */
export class PublishingService {
  constructor(private readonly store: Store) {}

  /**
   * Freeze the submitted page and point its path at it.
   *
   * The publication id is DERIVED from the content, not random. Two publishes
   * of identical content produce the same id and the same frozen object, so a
   * retried Deluge call — a timeout where the write actually succeeded, say —
   * is harmless instead of creating a duplicate version. That is idempotency
   * without an idempotency table.
   */
  async publish(request: PublishRequest, now: Date): Promise<PublishedPage> {
    const sections = [...request.sections]
      .filter((s) => !s.hidden)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s) => ({
        sectionUuid: s.sectionUuid,
        displayOrder: s.displayOrder,
        sectionType: s.sectionType,
        sectionData: s.sectionData,
        isRequired: s.isRequired,
      }));

    const contentHash = sha256Hex(stableJson({ page: request.page, sections }));
    const publicationId = deterministicId("wpub", request.page.pageUuid, contentHash);

    /**
     * If this exact content was published before, the frozen object ALREADY
     * exists and is authoritative — including its original `publishedAt`.
     * Re-freezing it with a new timestamp would write different bytes under
     * the same immutable key, which is a contradiction, and was a real bug
     * caught by the smoke test rather than by reasoning.
     *
     * So: reuse the existing version and simply re-point the path at it.
     * "Publish the same thing twice" is one version published twice, not two
     * versions.
     */
    const existing = await this.store.getPublication(publicationId);

    const doc: PublishedPage = existing ?? {
      schemaVersion: 1,
      publicationId,
      contentHash,
      publishedAt: now.toISOString(),
      page: request.page,
      sections,
    };

    if (!existing) await this.store.putPublication(doc);
    await this.store.setLive(request.page.path, doc);
    // The INDEX records when this path last went live, which can be later
    // than the frozen version's own timestamp if an old version is re-pointed.
    await this.store.upsertIndexEntry({
      path: request.page.path,
      pageUuid: request.page.pageUuid,
      publicationId,
      publishedAt: now.toISOString(),
      internalTitle: request.page.internalTitle,
    });

    return doc;
  }

  async unpublish(path: string, reason: string | null, now: Date): Promise<void> {
    await this.store.setUnpublished(path, reason, now.toISOString());
    await this.store.removeIndexEntry(path);
  }

  /**
   * Roll a path back to an earlier frozen publication.
   *
   * This is why publications are immutable and why `Live_Publication_ID` is
   * written back into Creator: the id in Creator is the handle you roll back
   * to. Nothing is recomputed — the exact bytes that were live before go live
   * again.
   */
  async rollback(path: string, publicationId: string): Promise<PublishedPage | null> {
    const doc = await this.store.getPublication(publicationId);
    if (!doc || doc.page.path !== path) return null;
    await this.store.setLive(path, doc);
    await this.store.upsertIndexEntry({
      path,
      pageUuid: doc.page.pageUuid,
      publicationId: doc.publicationId,
      publishedAt: doc.publishedAt,
      internalTitle: doc.page.internalTitle,
    });
    return doc;
  }
}

/**
 * The Markets collection. Published whole, never row by row.
 *
 * WHY WHOLE. A market is referenced by 53 pages. Publishing one row at a time
 * means the map, the directory and the country pages can each be looking at a
 * different version of the truth for as long as the publish takes. Publishing
 * the set means the website swaps from one consistent collection to the next.
 *
 * It also makes DELETION work: a market removed in Creator simply is not in
 * the next publish. Row-by-row publishing has no way to express "this one is
 * gone" without a tombstone per market.
 */
export class MarketsService {
  constructor(private readonly store: Store) {}

  async publish(request: MarketsPublishRequest, now: Date): Promise<PublishedMarkets> {
    const duplicate = findDuplicateSlug(request.markets);
    if (duplicate) {
      throw new DuplicateMarketError(duplicate);
    }

    const markets = [...request.markets]
      .sort((a, b) => a.regionSlug.localeCompare(b.regionSlug) || a.name.localeCompare(b.name))
      .map((m) => ({
        slug: m.slug,
        name: m.name,
        region: m.region,
        regionSlug: m.regionSlug,
        utcOffset: m.utcOffset,
        x: m.x,
        y: m.y,
        // Derived here, not stored in Creator. A href typed by hand is a
        // 404 waiting to happen, and it can disagree with the slug it is
        // supposed to be built from.
        href: `/markets/${m.regionSlug}/${m.slug}`,
        // Field by field on purpose — a spread would let anything Creator
        // sends reach the public API. The cost is that a NEW field has to be
        // added here as well as to the schema: `authority` was accepted by
        // validation, then silently dropped right here, and the only symptom
        // was a key missing from the published JSON with no error anywhere.
        authority: m.authority,
        capabilities: [...m.capabilities]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((c) => ({ name: c.name, status: c.status })),
      }));

    const regions = (request.regions ?? regionsFromMarkets(request.markets))
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const contentHash = sha256Hex(stableJson({ markets, regions }));
    const publicationId = deterministicId("mpub", "markets", contentHash);

    // Same reasoning as a page publish: identical content is one version
    // published twice, so reuse the frozen object rather than re-freezing it
    // with a new timestamp under an immutable key.
    const existing = await this.store.getMarketsPublication(publicationId);
    const doc: PublishedMarkets = existing ?? {
      schemaVersion: 1,
      publicationId,
      contentHash,
      publishedAt: now.toISOString(),
      markets,
      regions,
    };

    if (!existing) await this.store.putMarketsPublication(doc);
    await this.store.setLiveMarkets(doc);
    return doc;
  }

  async getLive(): Promise<PublishedMarkets | null> {
    return this.store.getLiveMarkets();
  }

  async rollback(publicationId: string): Promise<PublishedMarkets | null> {
    const doc = await this.store.getMarketsPublication(publicationId);
    if (!doc) return null;
    await this.store.setLiveMarkets(doc);
    return doc;
  }
}

/** Refused, with the offending slug named — see findDuplicateSlug. */
export class DuplicateMarketError extends Error {
  constructor(readonly slugPath: string) {
    super(`Two markets share the path /markets/${slugPath}`);
  }
}

/**
 * Navigation, footer and certifications. Published whole, for the same reason
 * markets are: they appear on every page, so a half-applied change is visible
 * everywhere at once.
 */
export class SiteService {
  constructor(private readonly store: Store) {}

  async publish(request: SitePublishRequest, now: Date): Promise<PublishedSite> {
    const duplicate = findDuplicateKey(request.nav);
    if (duplicate) throw new DuplicateNavKeyError(duplicate);

    const nav = nestNav(request.nav);
    if (nav.length === 0) {
      // Every item hidden is almost certainly a mistake, and a site with no
      // navigation is unusable on every page at once.
      throw new EmptyNavigationError();
    }

    const certifications = [...request.certifications]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((c) => ({
        name: c.name,
        expiresOn: c.expiresOn,
        certificateNumber: c.certificateNumber,
      }));

    const legal = legalLinks(request.nav);
    const contentHash = sha256Hex(
      stableJson({ nav, legal, footer: request.footer, certifications }),
    );
    const publicationId = deterministicId("spub", "site", contentHash);

    const existing = await this.store.getSitePublication(publicationId);
    const doc: PublishedSite = existing ?? {
      schemaVersion: 1,
      publicationId,
      contentHash,
      publishedAt: now.toISOString(),
      nav,
      legal,
      footer: request.footer,
      certifications,
    };

    if (!existing) await this.store.putSitePublication(doc);
    await this.store.setLiveSite(doc);
    return doc;
  }

  async getLive(): Promise<PublishedSite | null> {
    return this.store.getLiveSite();
  }

  async rollback(publicationId: string): Promise<PublishedSite | null> {
    const doc = await this.store.getSitePublication(publicationId);
    if (!doc) return null;
    await this.store.setLiveSite(doc);
    return doc;
  }
}

export class DuplicateNavKeyError extends Error {
  constructor(readonly key: string) {
    super(`Two navigation items share the key "${key}"`);
  }
}

export class EmptyNavigationError extends Error {
  constructor() {
    super("Every navigation item is hidden. Publishing that would leave the site with no menu on any page.");
  }
}

/**
 * The Case Studies collection. Published whole, for the same reasons as
 * markets: the listing and every detail page read the same rows, and a record
 * deleted in Creator has to be expressible as "absent from the next publish".
 */
export class CaseStudiesService {
  constructor(private readonly store: Store) {}

  async publish(request: CaseStudiesPublishRequest, now: Date): Promise<PublishedCaseStudies> {
    const duplicate = findDuplicateCaseStudySlug(request.caseStudies);
    if (duplicate) throw new DuplicateCaseStudyError(duplicate);

    const caseStudies = [...request.caseStudies]
      .sort(
        (a, b) =>
          a.familySlug.localeCompare(b.familySlug) ||
          a.displayOrder - b.displayOrder ||
          a.title.localeCompare(b.title),
      )
      .map((c) => ({
        // Field by field on purpose. A spread would let anything Creator sends
        // reach the public API — and the inverse mistake, adding a field to
        // the schema and forgetting it here, publishes a clean 200 with the
        // key silently missing. That is exactly how `authority` was lost on
        // markets. If you add a field above, add it here.
        slug: c.slug,
        title: c.title,
        family: c.family,
        familySlug: c.familySlug,
        teaser: c.teaser,
        scenario: c.scenario,
        solution: c.solution,
        result: c.result,
        tags: [...c.tags],
        // Derived here, never stored in Creator: a href typed by hand is a
        // 404 waiting to happen.
        href: `/client-success/case-studies/${c.slug}`,
        order: c.displayOrder,
        metrics: [...c.metrics]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((m) => ({ value: m.value, label: m.label })),
      }));

    const contentHash = sha256Hex(stableJson({ caseStudies }));
    const publicationId = deterministicId("cpub", "case-studies", contentHash);

    // Identical content is one version published twice — reuse the frozen
    // object rather than re-freezing it under an immutable key.
    const existing = await this.store.getCaseStudiesPublication(publicationId);
    const doc: PublishedCaseStudies = existing ?? {
      schemaVersion: 1,
      publicationId,
      contentHash,
      publishedAt: now.toISOString(),
      caseStudies,
    };

    if (!existing) await this.store.putCaseStudiesPublication(doc);
    await this.store.setLiveCaseStudies(doc);
    return doc;
  }

  async getLive(): Promise<PublishedCaseStudies | null> {
    return this.store.getLiveCaseStudies();
  }

  async rollback(publicationId: string): Promise<PublishedCaseStudies | null> {
    const doc = await this.store.getCaseStudiesPublication(publicationId);
    if (!doc) return null;
    await this.store.setLiveCaseStudies(doc);
    return doc;
  }
}

/** Refused, with the offending slug named — see findDuplicateSlug. */
export class DuplicateCaseStudyError extends Error {
  constructor(readonly slug: string) {
    super(`Two case studies share the slug "${slug}"`);
    this.name = "DuplicateCaseStudyError";
  }
}
