import type { Source, RangeResponse } from "pmtiles";

/**
 * Cache Storage bucket holding downloaded .pmtiles archives.
 *
 * Bump the suffix (v1 → v2 → …) to force every client to drop the
 * old cached copy on next visit — useful if you ever need to break
 * a stale cache without changing the URL.
 */
const CACHE_NAME = "pmtiles-v1";

export interface CachedPMTilesSourceOpts {
  /**
   * Fired during the very first download. `total` is null if the
   * server omits Content-Length (unlikely for a static .pmtiles).
   */
  onProgress?: (loaded: number, total: number | null) => void;
  /**
   * Fired once the archive is fully in-memory and ready to serve
   * tiles. Useful for hiding a loading spinner.
   */
  onReady?: () => void;
}

/**
 * pmtiles `Source` that downloads the entire archive once, persists
 * it via the Cache Storage API, and serves every `getBytes` call out
 * of the in-memory `ArrayBuffer` afterwards.
 *
 * Trade-off:
 *   • First visit: blocks all tile rendering until the full file
 *     finishes downloading (~30 MB → ~5–30 s on typical connections).
 *   • Subsequent visits: zero network traffic — all reads slice into
 *     the cached buffer.
 *
 * Cache invalidation: the archive URL itself acts as the cache key,
 * so publishing a new tileset at a new URL (e.g. `…/hong-kong-v2.pmtiles`)
 * naturally triggers a fresh download for every client.
 *
 * Cache Storage may be unavailable (private-mode quirks, ephemeral
 * webviews, etc.); we fall back to an in-memory-only buffer that's
 * re-fetched per page load if writing to the cache fails.
 */
export class CachedPMTilesSource implements Source {
  private bufferPromise: Promise<ArrayBuffer> | null = null;

  constructor(
    private url: string,
    private opts: CachedPMTilesSourceOpts = {}
  ) {}

  /**
   * pmtiles' `Protocol.add` stores PMTiles by `source.getKey()`, and
   * its tile handler strips the leading `pmtiles://` from the
   * incoming URL before looking up by key. So we return the raw
   * archive URL — matching `pmtiles://<URL>` style references.
   */
  getKey(): string {
    return this.url;
  }

  async getBytes(
    offset: number,
    length: number,
    signal?: AbortSignal
  ): Promise<RangeResponse> {
    const buf = await this.ensureBuffer();
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    return { data: buf.slice(offset, offset + length) };
  }

  /** Kick off the download manually (e.g. on app boot). Idempotent. */
  prefetch(): Promise<ArrayBuffer> {
    return this.ensureBuffer();
  }

  private ensureBuffer(): Promise<ArrayBuffer> {
    if (this.bufferPromise) return this.bufferPromise;
    this.bufferPromise = this.loadBuffer().then(
      (buf) => {
        this.opts.onReady?.();
        return buf;
      },
      (err) => {
        // Clear so the next caller retries instead of forever
        // re-rejecting from the same memoised promise.
        this.bufferPromise = null;
        throw err;
      }
    );
    return this.bufferPromise;
  }

  private async loadBuffer(): Promise<ArrayBuffer> {
    const cache = await this.openCache();

    if (cache) {
      const hit = await cache.match(this.url);
      if (hit) return hit.arrayBuffer();
    }

    const response = await fetch(this.url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch pmtiles archive ${this.url}: HTTP ${response.status}`
      );
    }

    // Persist the network response in cache before consuming the body
    // — Cache.put accepts a Response and reads its body stream
    // independently of any subsequent .arrayBuffer() call on the
    // original. The clone() tees the underlying stream so both
    // consumers see the same bytes.
    if (cache) {
      try {
        await cache.put(this.url, response.clone());
      } catch (e) {
        // QuotaExceededError, private-mode restrictions, etc. — keep
        // the in-memory copy and proceed.
        console.warn("Failed to persist pmtiles in Cache Storage:", e);
      }
    }

    // Stream the body to drive progress reporting (when requested).
    // If no onProgress callback was provided, fall back to the simple
    // .arrayBuffer() path — fewer allocations, slightly faster.
    if (this.opts.onProgress && response.body) {
      return this.consumeWithProgress(response);
    }
    return response.arrayBuffer();
  }

  private async consumeWithProgress(response: Response): Promise<ArrayBuffer> {
    const total =
      Number.parseInt(response.headers.get("content-length") ?? "", 10) || null;
    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      this.opts.onProgress!(loaded, total);
    }
    const merged = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return merged.buffer;
  }

  private async openCache(): Promise<Cache | null> {
    if (typeof caches === "undefined") return null;
    try {
      return await caches.open(CACHE_NAME);
    } catch (e) {
      console.warn("Cache Storage unavailable:", e);
      return null;
    }
  }
}
