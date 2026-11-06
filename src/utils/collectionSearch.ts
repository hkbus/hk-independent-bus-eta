// Pure unified route/stop search over the app's existing hk-bus-eta DB shape.
type Name = { zh: string; en: string };
export interface RouteLike {
  route: string;
  orig: Name;
  dest: Name;
  co: string[];
  stops: Record<string, string[]>;
}
export interface StopLike {
  name: Name;
}

export interface RouteHit {
  type: "route";
  key: string;
  route: RouteLike;
}
export interface StopHit {
  type: "stop";
  id: string;
  co: string;
  name: Name;
}
export type Hit = RouteHit | StopHit;

const norm = (s: string) => s.trim().toLowerCase();
const stopsOf = (r: RouteLike): string[] => {
  for (const c of r.co) if (c in r.stops) return r.stops[c];
  return [];
};

/** Routes: route-number prefix first, then origin/destination substring. Stops: name substring (zh/en). */
export const searchAll = (
  routeList: Record<string, RouteLike>,
  stopList: Record<string, StopLike>,
  query: string,
  limit = 30
): { routes: RouteHit[]; stops: StopHit[] } => {
  const q = norm(query);
  if (!q) return { routes: [], stops: [] };
  const exact: RouteHit[] = [],
    prefix: RouteHit[] = [],
    other: RouteHit[] = [];
  for (const [key, route] of Object.entries(routeList)) {
    const no = route.route.toLowerCase();
    if (no === q) exact.push({ type: "route", key, route });
    else if (no.startsWith(q)) prefix.push({ type: "route", key, route });
    else if (
      [route.orig, route.dest].some(
        (n) => n.zh.includes(q) || n.en.toLowerCase().includes(q)
      )
    )
      other.push({ type: "route", key, route });
  }
  const routes = [...exact, ...prefix, ...other].slice(0, limit);

  // map stop -> company of the first route that serves it (needed for the `co|stopId` bookmark key)
  const coOf: Record<string, string> = {};
  const stops: StopHit[] = [];
  const wanted = new Set<string>();
  for (const [id, s] of Object.entries(stopList)) {
    if (s.name.zh.includes(q) || s.name.en.toLowerCase().includes(q)) {
      wanted.add(id);
      if (wanted.size >= limit * 4) break;
    }
  }
  if (wanted.size) {
    for (const r of Object.values(routeList)) {
      const c = r.co.find((x) => x in r.stops);
      if (!c) continue;
      for (const id of r.stops[c])
        if (wanted.has(id) && !(id in coOf)) coOf[id] = c;
    }
    for (const id of wanted) {
      if (id in coOf && stops.length < limit)
        stops.push({ type: "stop", id, co: coOf[id], name: stopList[id].name });
    }
  }
  return { routes, stops };
};

/** All `routeKey/seq` items passing through a stop (for adding routes from a stop result). */
export const routesAtStop = (
  routeList: Record<string, RouteLike>,
  stopId: string
) => {
  const out: { key: string; seq: number; route: RouteLike }[] = [];
  for (const [key, route] of Object.entries(routeList)) {
    const seq = stopsOf(route).indexOf(stopId);
    if (seq >= 0) out.push({ key, seq, route });
  }
  return out;
};

export const stopsOfRoute = stopsOf;
