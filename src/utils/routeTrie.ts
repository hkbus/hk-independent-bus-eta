export interface RouteTrie {
  children: Map<string, RouteTrie>;
}

/** Trie of route numbers whose operators intersect `companies`. */
export const buildRouteTrie = (
  routeList: Record<string, { co: string[] }> | null | undefined,
  companies: readonly string[]
): RouteTrie => {
  const root: RouteTrie = { children: new Map() };
  if (routeList == null) return root;
  for (const [routeNo, meta] of Object.entries(routeList)) {
    if (!meta.co.some((c) => companies.includes(c))) continue;
    let node = root;
    for (const ch of routeNo) {
      let next = node.children.get(ch);
      if (!next) node.children.set(ch, (next = { children: new Map() }));
      node = next;
    }
  }
  return root;
};

/** Characters that can follow `prefix` ("-" excluded, as the keypad never uses it). */
export const nextChars = (root: RouteTrie, prefix: string): string[] => {
  let node: RouteTrie | undefined = root;
  for (const ch of prefix.toUpperCase()) node = node?.children.get(ch);
  return node ? [...node.children.keys()].filter((k) => k !== "-") : [];
};
