import type {
  BusSortOrder,
  ColorMode,
  EtaFormat,
  Language,
  NumPadOrder,
} from "../data";
import type { RouteCollection } from "../@types/types";

// The subset of app state that gets synced across devices in a sync group.
// Kept separate from AppState/CollectionState so device-local fields
// (geolocation, refresh interval, transient UI state, ...) never leak in.
export interface SyncDocShape {
  savedStops: string[];
  savedEtas: string[];
  collections: RouteCollection[];
  _colorMode: ColorMode;
  energyMode: boolean;
  platformMode: boolean;
  etaFormat: EtaFormat;
  numPadOrder: NumPadOrder;
  isRouteFilter: boolean;
  busSortOrder: BusSortOrder;
  annotateScheduled: boolean;
  isRecentSearchShown: boolean;
  fontSize: number;
  searchRange: number;
  lang: Language;
  // Automerge's generics require an index signature on document shapes.
  [key: string]: unknown;
}

type AutomergeModule = typeof import("@automerge/automerge");
export type SyncDoc = import("@automerge/automerge").Doc<SyncDocShape>;

// @automerge/automerge is WASM-backed and non-trivial in size, so it's only
// ever dynamically imported here — code that never touches sync (the vast
// majority of page loads) never pays for it.
let automergePromise: Promise<AutomergeModule> | null = null;
const getAutomerge = (): Promise<AutomergeModule> => {
  if (!automergePromise) {
    automergePromise = import("@automerge/automerge");
  }
  return automergePromise;
};

export const createSyncDoc = async (
  initial: SyncDocShape
): Promise<SyncDoc> => {
  const Automerge = await getAutomerge();
  return Automerge.from<SyncDocShape>(initial);
};

export const loadSyncDoc = async (bytes: Uint8Array): Promise<SyncDoc> => {
  const Automerge = await getAutomerge();
  return Automerge.load<SyncDocShape>(bytes);
};

export const saveSyncDoc = async (doc: SyncDoc): Promise<Uint8Array> => {
  const Automerge = await getAutomerge();
  return Automerge.save(doc);
};

// Applies exactly the add/remove operations this device made to a favorites
// list since `base` (the fields as of this device's last successful sync),
// onto the shared Automerge list draft. This is deliberately a *delta*
// against a remembered baseline, not a diff against the list's current
// contents: diffing against current contents would treat "another device
// added this and I don't have it" the same as "I removed this", and delete
// it right back out — silently discarding the other device's favorite.
// Diffing against what *this device* last knew is the only way to tell
// "never had it" apart from "removed it".
//
// Mutating the existing list object in place (splice/push) instead of
// replacing it wholesale (`draft.savedStops = next`) also matters on its
// own: a wholesale replace creates a brand new list *object*, and if two
// devices both do that concurrently, Automerge just picks one side's list
// and discards the other's — no merge. Splicing/pushing on the same
// existing list object means each device's adds/removes become individual
// CRDT operations against that one shared list, which Automerge can
// genuinely combine across devices.
const reconcileListSinceBase = (
  draftList: string[],
  base: string[],
  current: string[]
) => {
  base.forEach((item) => {
    if (!current.includes(item)) {
      const idx = draftList.indexOf(item);
      if (idx !== -1) draftList.splice(idx, 1);
    }
  });
  current.forEach((item) => {
    if (!base.includes(item) && !draftList.includes(item)) {
      draftList.push(item);
    }
  });
};

// Layers this device's current field values onto `doc` as a single Automerge
// change, using `base` (this device's fields as of its last successful sync,
// or null if it has never synced before) to compute what actually
// changed locally. `doc` must already be the shared lineage (loaded from the
// group's latest bytes, or freshly created via createSyncDoc for a brand new
// group) — never a second independently-created doc — otherwise
// savedStops/savedEtas can't merge across devices (see
// reconcileListSinceBase above).
// Last-write-wins fields, but only "win" if this device actually changed the
// field since its own last sync — otherwise a device that hasn't touched a
// setting would keep re-stamping its stale value over whatever another
// device just pushed, on every poll. `collections` lives here too even
// though it's a list: unlike savedStops/savedEtas it isn't a flat set of
// independent additions/removals (drag-reordering, renames, and per-route
// stop edits all live inside it), so there's no add/remove delta to
// reconcile — concurrent edits from two devices between syncs mean one
// side's collections edit is discarded, same as any other field here.
const LAST_WRITE_WINS_FIELDS = [
  "collections",
  "_colorMode",
  "energyMode",
  "platformMode",
  "etaFormat",
  "numPadOrder",
  "isRouteFilter",
  "busSortOrder",
  "annotateScheduled",
  "isRecentSearchShown",
  "fontSize",
  "searchRange",
  "lang",
] as const satisfies readonly (keyof SyncDocShape)[];

export const applyFieldsSinceBase = async (
  doc: SyncDoc,
  base: SyncDocShape | null,
  current: SyncDocShape
): Promise<SyncDoc> => {
  const Automerge = await getAutomerge();
  return Automerge.change(doc, (draft) => {
    reconcileListSinceBase(
      draft.savedStops,
      base?.savedStops ?? [],
      current.savedStops
    );
    reconcileListSinceBase(
      draft.savedEtas,
      base?.savedEtas ?? [],
      current.savedEtas
    );
    // base is only ever null when this device has no synced baseline for an
    // *existing* group (joining, or a lost localStorage) — createSyncDoc
    // handles the brand-new-group case directly and never calls this. With
    // no baseline there's nothing to say "this device changed since", so
    // scalars fall back to the group's current values rather than this
    // device's (join adopts the group's settings/collections, not the
    // reverse).
    LAST_WRITE_WINS_FIELDS.forEach((field) => {
      if (
        base &&
        JSON.stringify(current[field]) !== JSON.stringify(base[field])
      ) {
        (draft as Record<string, unknown>)[field] = current[field];
      }
    });
  });
};

export const readFields = (doc: SyncDoc): SyncDocShape => ({
  savedStops: doc.savedStops,
  savedEtas: doc.savedEtas,
  collections: doc.collections,
  _colorMode: doc._colorMode,
  energyMode: doc.energyMode,
  platformMode: doc.platformMode,
  etaFormat: doc.etaFormat,
  numPadOrder: doc.numPadOrder,
  isRouteFilter: doc.isRouteFilter,
  busSortOrder: doc.busSortOrder,
  annotateScheduled: doc.annotateScheduled,
  isRecentSearchShown: doc.isRecentSearchShown,
  fontSize: doc.fontSize,
  searchRange: doc.searchRange,
  lang: doc.lang,
});
