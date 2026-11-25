import MiniSearch from "minisearch";
import type { RouteListEntry, StopListEntry } from "hk-bus-eta";

const MAX_RESULTS = 30;
const TOKEN_RE = /[㐀-鿿豈-﫿]+|[a-z0-9]+/g;
const CJK_RE = /^[㐀-鿿豈-﫿]/;

// Latin/digit runs -> words; CJK runs -> overlapping bigrams (single char if
// the run is 1 long), so partial Chinese input works without a word segmenter.
export const tokenize = (text: string): string[] =>
  (text.toLowerCase().match(TOKEN_RE) ?? []).flatMap((run) => {
    if (!CJK_RE.test(run) || run.length === 1) return [run];
    return Array.from({ length: run.length - 1 }, (_, i) =>
      run.slice(i, i + 2)
    );
  });

export interface NameIndexInput {
  routeList: Record<string, RouteListEntry>;
  stopList: Record<string, StopListEntry>;
}

export interface NameSearchResult {
  routes: string[]; // routeList keys
  stops: string[]; // stopList keys
}

const options = {
  tokenize,
  idField: "id",
  searchOptions: {
    prefix: true,
    combineWith: "AND" as const,
    // ponytail: edit distance only on Latin terms; CJK bigrams are exact/prefix.
    fuzzy: (t: string) => (/^[a-z0-9]+$/.test(t) && t.length > 3 ? 0.2 : false),
  },
};

export const buildNameIndex = ({ routeList, stopList }: NameIndexInput) => {
  const routeIndex = new MiniSearch({
    ...options,
    fields: ["route", "orig", "dest"],
    // ponytail: boost route no.; tune if terminus names should rank higher.
    searchOptions: { ...options.searchOptions, boost: { route: 3 } },
  });
  routeIndex.addAll(
    Object.entries(routeList).map(([id, r]) => ({
      id,
      route: id.split("-")[0],
      orig: `${r.orig.zh} ${r.orig.en}`,
      dest: `${r.dest.zh} ${r.dest.en}`,
    }))
  );

  const stopIndex = new MiniSearch({ ...options, fields: ["name"] });
  stopIndex.addAll(
    Object.entries(stopList).map(([id, s]) => ({
      id,
      name: `${s.name.zh} ${s.name.en}`,
    }))
  );

  return (query: string): NameSearchResult => {
    if (!query.trim()) return { routes: [], stops: [] };
    const pick = (idx: MiniSearch) =>
      idx
        .search(query)
        .slice(0, MAX_RESULTS)
        .map((r) => r.id as string);
    return { routes: pick(routeIndex), stops: pick(stopIndex) };
  };
};
