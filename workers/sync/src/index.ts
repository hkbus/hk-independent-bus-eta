export interface Env {
  SYNC_KV: KVNamespace;
  ALLOWED_ORIGINS: string;
}

const MAX_BODY_BYTES = 200 * 1024; // 200KB
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 30;
// Per-token limiting alone doesn't stop a single client from minting an
// unbounded number of fresh random tokens (each one a brand new KV entry
// nobody else knows about) — this bounds that per source IP instead.
const IP_RATE_LIMIT_MAX_REQUESTS = 60;

interface SyncMetadata {
  updatedAt: number;
}

const allowedOrigin = (request: Request, env: Env): string | null => {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  return allowed.includes(origin) ? origin : null;
};

const corsHeaders = (origin: string | null): HeadersInit => ({
  ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Expose-Headers": "X-Updated-At",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const jsonResponse = (
  body: unknown,
  status: number,
  origin: string | null,
  extraHeaders: HeadersInit = {}
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  });

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const extractToken = (request: Request): string | null => {
  const header = request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  // sanity bound: our client-generated tokens are ~32 base32 chars.
  if (token.length < 16 || token.length > 128) return null;
  return token;
};

// ponytail: in-memory per-isolate fixed-window counter, not a KV write per
// request. A token's requests can land on multiple isolates/colos, so this
// under-counts globally — it's a soft cap against a single runaway client,
// not a hard quota. A KV-backed counter would be a real global cap but costs
// a KV write per request, which is what blew the free-tier write quota here
// in the first place (see MAX_BODY_BYTES-adjacent PUT below). Upgrade to
// Cloudflare's Workers rate-limiting binding if a hard global cap is needed.
const rateLimitCounters = new Map<string, { window: number; count: number }>();
const ipRateLimitCounters = new Map<
  string,
  { window: number; count: number }
>();
// Bounds how many distinct token/IP keys an isolate accumulates: once a map
// gets big, drop entries from any window older than the current one instead
// of letting it grow forever for the isolate's lifetime.
const MAX_TRACKED_KEYS = 5_000;
const checkRateLimit = (
  key: string,
  max: number,
  counters: Map<string, { window: number; count: number }>
): boolean => {
  const window = Math.floor(Date.now() / 1000 / RATE_LIMIT_WINDOW_SECONDS);
  if (counters.size > MAX_TRACKED_KEYS) {
    for (const [k, v] of counters) {
      if (v.window !== window) counters.delete(k);
    }
  }
  const entry = counters.get(key);
  if (!entry || entry.window !== window) {
    counters.set(key, { window, count: 1 });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
};

const handleGet = async (
  env: Env,
  tokenHash: string,
  origin: string | null
): Promise<Response> => {
  const { value, metadata } = await env.SYNC_KV.getWithMetadata<SyncMetadata>(
    `doc:${tokenHash}`,
    "arrayBuffer"
  );
  if (!value) {
    return jsonResponse({ error: "not_found" }, 404, origin);
  }
  return new Response(value, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Updated-At": String(metadata?.updatedAt ?? 0),
      ...corsHeaders(origin),
    },
  });
};

const handlePut = async (
  request: Request,
  env: Env,
  tokenHash: string,
  origin: string | null
): Promise<Response> => {
  // ponytail: rejects on the declared Content-Length before buffering, but a
  // chunked request with no/false header still gets fully buffered before
  // the byteLength check below catches it — bounded by the platform's own
  // request body cap (well above MAX_BODY_BYTES), not by this function.
  const declaredLength = parseInt(
    request.headers.get("Content-Length") ?? "",
    10
  );
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: "payload_too_large" }, 413, origin);
  }
  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return jsonResponse({ error: "empty_body" }, 400, origin);
  }
  if (body.byteLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: "payload_too_large" }, 413, origin);
  }
  // ponytail: last-write-wins, no compare-and-swap. KV has no atomic
  // conditional write, so two devices racing a GET-merge-PUT can still drop
  // one's update — narrowed by the 60s client poll interval, not eliminated.
  // A real fix needs a storage layer with actual serialization (Durable
  // Object) — that's a bigger call than this endpoint should make on its own.
  const updatedAt = Date.now();
  await env.SYNC_KV.put(`doc:${tokenHash}`, body, {
    metadata: { updatedAt } satisfies SyncMetadata,
  });
  return jsonResponse({ updatedAt }, 200, origin);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = allowedOrigin(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname !== "/v1/sync") {
      return jsonResponse({ error: "not_found" }, 404, origin);
    }

    const clientIp = request.headers.get("CF-Connecting-IP") ?? "unknown";
    if (
      !checkRateLimit(clientIp, IP_RATE_LIMIT_MAX_REQUESTS, ipRateLimitCounters)
    ) {
      return jsonResponse({ error: "rate_limited" }, 429, origin);
    }

    const token = extractToken(request);
    if (!token) {
      return jsonResponse({ error: "unauthorized" }, 401, origin);
    }
    const tokenHash = await sha256Hex(token);

    if (!checkRateLimit(tokenHash, RATE_LIMIT_MAX_REQUESTS, rateLimitCounters)) {
      return jsonResponse({ error: "rate_limited" }, 429, origin);
    }

    if (request.method === "GET") {
      return handleGet(env, tokenHash, origin);
    }
    if (request.method === "PUT") {
      return handlePut(request, env, tokenHash, origin);
    }
    return jsonResponse({ error: "method_not_allowed" }, 405, origin);
  },
};
