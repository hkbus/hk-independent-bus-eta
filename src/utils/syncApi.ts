const SYNC_API_URL = import.meta.env.VITE_SYNC_API_URL as string | undefined;

export const isSyncConfigured = (): boolean => !!SYNC_API_URL;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// A sync group token doubles as its own credential — 160 bits of entropy,
// base32-encoded so it's easy to type/copy/share as plain text or a QR code.
export const generateSyncToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let bits = "";
  bytes.forEach((b) => {
    bits += b.toString(2).padStart(8, "0");
  });
  let token = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    token += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return token;
};

const TOKEN_PATTERN = /^[A-Z2-7]{16,128}$/;

// Accepts a bare token, a full pair URL, or a pair URL's #fragment and
// returns just the token, uppercased — or "" if what's left over isn't a
// well-formed token (garbage pasted in, or a URL without a fragment at all).
export const parseToken = (input: string): string => {
  const trimmed = input.trim().replace(/^#/, "");
  const match = trimmed.match(/\/sync#?([A-Z2-7]+)\/?$/i);
  const candidate = (match ? match[1] : trimmed).toUpperCase();
  return TOKEN_PATTERN.test(candidate) ? candidate : "";
};

export interface SyncPullResult {
  bytes: Uint8Array;
  updatedAt: number;
}

const SYNC_TIMEOUT_MS = 15_000;

export const pullSyncDoc = async (
  token: string
): Promise<SyncPullResult | null> => {
  if (!SYNC_API_URL) throw new Error("Sync API is not configured");
  const res = await fetch(`${SYNC_API_URL}/v1/sync`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(SYNC_TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Sync pull failed: ${res.status}`);
  const updatedAt = parseInt(res.headers.get("X-Updated-At") ?? "0", 10);
  const bytes = new Uint8Array(await res.arrayBuffer());
  return { bytes, updatedAt };
};

export const pushSyncDoc = async (
  token: string,
  bytes: Uint8Array
): Promise<number> => {
  if (!SYNC_API_URL) throw new Error("Sync API is not configured");
  const res = await fetch(`${SYNC_API_URL}/v1/sync`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: bytes,
    signal: AbortSignal.timeout(SYNC_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Sync push failed: ${res.status}`);
  const { updatedAt } = (await res.json()) as { updatedAt: number };
  return updatedAt;
};
