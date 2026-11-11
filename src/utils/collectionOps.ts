import type { RouteCollection } from "../@types/types";

// Pure, immutable helpers for the collection editor. Item = "routeId/seq" string.

export const addItem = (c: RouteCollection, item: string): RouteCollection =>
  c.list.includes(item) ? c : { ...c, list: [...c.list, item] };

export const removeItem = (
  c: RouteCollection,
  item: string
): RouteCollection => ({
  ...c,
  list: c.list.filter((i) => i !== item),
});

/** Move item at `from` to index `to` (clamped). Out-of-range `from` is a no-op. */
export const moveWithin = (
  list: string[],
  from: number,
  to: number
): string[] => {
  if (from < 0 || from >= list.length) return list;
  const t = Math.max(0, Math.min(list.length - 1, to));
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(t, 0, x);
  return next;
};

/** Move an item between collections; skips duplicates in the target (still removes from source). */
export const moveBetween = (
  cs: RouteCollection[],
  item: string,
  from: number,
  to: number
): RouteCollection[] =>
  from === to || !cs[from]?.list.includes(item) || !cs[to]
    ? cs
    : cs.map((c, i) =>
        i === from ? removeItem(c, item) : i === to ? addItem(c, item) : c
      );

/** Like moveBetween but inserts at `toIndex` (clamped). No-op if the target already has the item. */
export const moveBetweenAt = (
  cs: RouteCollection[],
  item: string,
  from: number,
  to: number,
  toIndex: number
): RouteCollection[] => {
  if (from === to || !cs[from]?.list.includes(item) || !cs[to]) return cs;
  if (cs[to].list.includes(item)) return cs;
  const at = Math.max(0, Math.min(cs[to].list.length, toIndex));
  return cs.map((c, i) =>
    i === from
      ? removeItem(c, item)
      : i === to
        ? { ...c, list: [...c.list.slice(0, at), item, ...c.list.slice(at)] }
        : c
  );
};

/** Duplicate with a unique name ("X copy", "X copy 2", ...) inserted after the original. */
export const duplicateCollection = (
  cs: RouteCollection[],
  idx: number
): RouteCollection[] => {
  const src = cs[idx];
  if (!src) return cs;
  const names = new Set(cs.map((c) => c.name));
  let name = `${src.name} copy`;
  for (let n = 2; names.has(name); n++) name = `${src.name} copy ${n}`;
  const copy: RouteCollection = structuredClone({ ...src, name });
  return [...cs.slice(0, idx + 1), copy, ...cs.slice(idx + 1)];
};

/** Validate untrusted localStorage/import data: drop malformed entries instead of crashing. */
export const sanitizeCollections = (raw: unknown): RouteCollection[] =>
  Array.isArray(raw)
    ? raw
        .filter((c) => c && typeof c.name === "string" && Array.isArray(c.list))
        .map((c) => ({
          name: c.name,
          list: c.list.filter((i: unknown) => typeof i === "string"),
          schedules: Array.isArray(c.schedules) ? c.schedules : [],
        }))
    : [];
