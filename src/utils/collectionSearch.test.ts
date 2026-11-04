import { describe, expect, it } from "vitest";
import { routesAtStop, searchAll } from "./collectionSearch";

const n = (zh: string, en: string) => ({ zh, en });
const routes = {
  "1-a": {
    route: "1",
    orig: n("尖沙咀", "TST"),
    dest: n("中環", "Central"),
    co: ["kmb"],
    stops: { kmb: ["s1", "s2"] },
  },
  "10-a": {
    route: "10",
    orig: n("北角", "North Point"),
    dest: n("堅尼地城", "Kennedy Town"),
    co: ["ctb"],
    stops: { ctb: ["s2", "s3"] },
  },
  A1: {
    route: "A1",
    orig: n("機場", "Airport"),
    dest: n("中環", "Central"),
    co: ["ctb"],
    stops: { ctb: ["s3"] },
  },
};
const stops = {
  s1: { name: n("彌敦道", "Nathan Road") },
  s2: { name: n("中環碼頭", "Central Pier") },
  s3: { name: n("機場", "Airport") },
};

describe("collectionSearch", () => {
  it("ranks exact route number before prefix, and finds by destination", () => {
    expect(searchAll(routes, stops, "1").routes.map((r) => r.key)).toEqual([
      "1-a",
      "10-a",
    ]);
    expect(
      searchAll(routes, stops, "central")
        .routes.map((r) => r.key)
        .sort()
    ).toEqual(["1-a", "A1"]);
  });
  it("finds stops by zh/en name with company", () => {
    const r = searchAll(routes, stops, "nathan");
    expect(r.stops).toEqual([
      { type: "stop", id: "s1", co: "kmb", name: stops.s1.name },
    ]);
    expect(searchAll(routes, stops, "中環").stops[0].id).toBe("s2");
  });
  it("empty query gives nothing; routesAtStop gives seq", () => {
    expect(searchAll(routes, stops, "  ")).toEqual({ routes: [], stops: [] });
    expect(routesAtStop(routes, "s2").map((x) => [x.key, x.seq])).toEqual([
      ["1-a", 1],
      ["10-a", 0],
    ]);
  });
});
