import { describe, expect, it } from "vitest";
import { buildNameIndex, tokenize } from "./nameSearch";

const route = (orig: [string, string], dest: [string, string]) =>
  ({
    orig: { zh: orig[0], en: orig[1] },
    dest: { zh: dest[0], en: dest[1] },
  } as any);

const search = buildNameIndex({
  routeList: {
    "1A-1-STAR-FERRY": route(["尖沙咀碼頭", "Star Ferry"], ["竹園邨", "Chuk Yuen Estate"]),
    "2-1-LAM-TIN": route(["藍田", "Lam Tin"], ["中環", "Central"]),
  },
  stopList: {
    s1: { location: { lat: 0, lng: 0 }, name: { zh: "尖沙咀碼頭", en: "Star Ferry" } },
    s2: { location: { lat: 0, lng: 0 }, name: { zh: "竹園邨", en: "Chuk Yuen Estate" } },
  },
});

describe("tokenize", () => {
  it("handles zh, en, mixed and route numbers", () => {
    expect(tokenize("尖沙咀")).toEqual(["尖沙", "沙咀"]);
    expect(tokenize("尖")).toEqual(["尖"]);
    expect(tokenize("Star-Ferry 1A")).toEqual(["star", "ferry", "1a"]);
    expect(tokenize("尖沙咀star")).toEqual(["尖沙", "沙咀", "star"]);
  });
});

describe("search", () => {
  it("matches partial Chinese", () => {
    expect(search("尖沙").routes).toEqual(["1A-1-STAR-FERRY"]);
    expect(search("尖沙").stops).toEqual(["s1"]);
  });
  it("tolerates English typos", () => {
    expect(search("Chuk Yeun").routes).toEqual(["1A-1-STAR-FERRY"]);
  });
  it("combines mixed Chinese and English", () => {
    expect(search("star 尖沙咀").stops).toEqual(["s1"]);
    expect(search("star 藍田").routes).toEqual([]);
  });
  it("matches route number", () => {
    expect(search("1a").routes[0]).toBe("1A-1-STAR-FERRY");
  });
  it("returns nothing for blank query", () => {
    expect(search("  ")).toEqual({ routes: [], stops: [] });
  });
});
