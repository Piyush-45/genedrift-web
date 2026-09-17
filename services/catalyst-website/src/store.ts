import type { LiveIndexEntry, PublishedPage } from "./domain";
import type { PublishedMarkets } from "./markets";
import type { PublishedSite } from "./site";
import { sha256Hex } from "./security";

/**
 * Storage, entirely in one private Stratus bucket. No Data Store tables.
 *
 * WHY. The editorial service uses Data Store because it has genuinely
 * relational work to do: request queues, leases, retry outboxes, attempt
 * counts. The website publisher has none of that. It stores a frozen document
 * and remembers which one is live. That is two object writes.
 *
 * The cost of the simpler choice, stated honestly: no queries, and pointer
 * updates are last-write-wins rather than compare-and-swap. With one or two
 * editors and a publish taking well under a second, two publishes of the SAME
 * page colliding is not a realistic failure. If the client ever puts a team on
 * this, move the pointers into Data Store and add a CAS — the rest of the
 * service does not change.
 *
 * Layout:
 *   publications/<publicationId>.json   immutable, never overwritten
 *   live/<path>.json                    the currently live document for a path
 *   index/live.json                     every live path, for sitemaps
 *   collections/markets.json            the currently live Markets collection
 *   collections/site.json               the currently live navigation and footer
 *
 * The Markets collection uses the same two-object shape as a page — a frozen
 * publication plus a pointer — so rollback works identically for both.
 */

type Bucket = {
  putObject(key: string, body: Buffer, options?: Record<string, unknown>): Promise<unknown>;
  getObject(key: string): Promise<AsyncIterable<Buffer> | NodeJS.ReadableStream>;
  deleteObject?(key: string): Promise<unknown>;
};

async function streamToBuffer(stream: AsyncIterable<Buffer> | NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * "/" becomes `_root`; "/a/b" becomes "a/b". Path segments are already
 * restricted to URL-safe characters by `pathSchema`, so they are safe as
 * object-key segments without further escaping.
 */
export function pathToObjectKey(path: string): string {
  const trimmed = path.replace(/^\//, "");
  return `live/${trimmed === "" ? "_root" : trimmed}.json`;
}

export class Store {
  constructor(private readonly bucket: Bucket) {}

  private async putJson(key: string, value: unknown, immutable: boolean): Promise<void> {
    const body = Buffer.from(JSON.stringify(value));
    try {
      await this.bucket.putObject(key, body, {
        overwrite: !immutable,
        contentType: "application/json",
      });
    } catch (error) {
      if (!immutable) throw error;
      // A retried publish can race the existence check. An immutable key may
      // only be reused when the stored bytes are byte-for-byte identical —
      // otherwise this is a genuine collision and must surface.
      const existing = await this.getRaw(key).catch(() => null);
      if (!existing || sha256Hex(existing) !== sha256Hex(body)) throw error;
    }
  }

  private async getRaw(key: string): Promise<Buffer> {
    return streamToBuffer(await this.bucket.getObject(key));
  }

  private async getJson<T>(key: string): Promise<T | null> {
    try {
      return JSON.parse((await this.getRaw(key)).toString("utf8")) as T;
    } catch {
      return null;
    }
  }

  /** Freeze a publication. Never overwritten — this is what rollback reads. */
  async putPublication(doc: PublishedPage): Promise<void> {
    await this.putJson(`publications/${doc.publicationId}.json`, doc, true);
  }

  async getPublication(publicationId: string): Promise<PublishedPage | null> {
    return this.getJson<PublishedPage>(`publications/${publicationId}.json`);
  }

  /** Point a path at a frozen publication. Overwrites by design. */
  async setLive(path: string, doc: PublishedPage): Promise<void> {
    await this.putJson(pathToObjectKey(path), doc, false);
  }

  async getLive(path: string): Promise<PublishedPage | null> {
    return this.getJson<PublishedPage>(pathToObjectKey(path));
  }

  async listLive(): Promise<LiveIndexEntry[]> {
    return (await this.getJson<LiveIndexEntry[]>("index/live.json")) ?? [];
  }

  async upsertIndexEntry(entry: LiveIndexEntry): Promise<void> {
    const rows = (await this.listLive()).filter((r) => r.path !== entry.path);
    rows.push(entry);
    rows.sort((a, b) => a.path.localeCompare(b.path));
    await this.putJson("index/live.json", rows, false);
  }

  async removeIndexEntry(path: string): Promise<void> {
    const rows = (await this.listLive()).filter((r) => r.path !== path);
    await this.putJson("index/live.json", rows, false);
  }

  /* ------------------------------------------------------ collections --- */

  /** Freeze a Markets publication. Same immutability rule as a page. */
  async putMarketsPublication(doc: PublishedMarkets): Promise<void> {
    await this.putJson(`publications/${doc.publicationId}.json`, doc, true);
  }

  async getMarketsPublication(publicationId: string): Promise<PublishedMarkets | null> {
    return this.getJson<PublishedMarkets>(`publications/${publicationId}.json`);
  }

  async setLiveMarkets(doc: PublishedMarkets): Promise<void> {
    await this.putJson("collections/markets.json", doc, false);
  }

  async getLiveMarkets(): Promise<PublishedMarkets | null> {
    return this.getJson<PublishedMarkets>("collections/markets.json");
  }

  async putSitePublication(doc: PublishedSite): Promise<void> {
    await this.putJson(`publications/${doc.publicationId}.json`, doc, true);
  }

  async getSitePublication(publicationId: string): Promise<PublishedSite | null> {
    return this.getJson<PublishedSite>(`publications/${publicationId}.json`);
  }

  async setLiveSite(doc: PublishedSite): Promise<void> {
    await this.putJson("collections/site.json", doc, false);
  }

  async getLiveSite(): Promise<PublishedSite | null> {
    return this.getJson<PublishedSite>("collections/site.json");
  }

  /**
   * Unpublish writes a tombstone rather than deleting the object. The website
   * can then answer 410 Gone, which tells a search engine (and a person) that
   * the page was withdrawn — far better than a 404 implying it never existed.
   * The frozen publications stay, so republishing is a pointer move.
   */
  async setUnpublished(path: string, reason: string | null, at: string): Promise<void> {
    await this.putJson(pathToObjectKey(path), { unpublished: true, reason, at }, false);
  }
}

export interface Tombstone {
  unpublished: true;
  reason: string | null;
  at: string;
}

export function isTombstone(value: unknown): value is Tombstone {
  return Boolean(value) && (value as Tombstone).unpublished === true;
}
