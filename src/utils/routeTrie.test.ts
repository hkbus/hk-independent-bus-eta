import { describe, expect, it } from "vitest";
import { buildRouteTrie, nextChars } from "./routeTrie";

const routes = {
  "1": { co: ["kmb"] },
  "1A": { co: ["kmb"] },
  K14: { co: ["mtr"] },
  "N-1": { co: ["kmb"] },
  "2": { co: ["gmb"] },
};

describe("routeTrie", () => {
  const kmbMtr = buildRouteTrie(routes, ["kmb", "mtr"]);

  it("lists next chars per prefix", () => {
    expect(nextChars(kmbMtr, "").sort()).toEqual(["1", "K", "N"]);
    expect(nextChars(kmbMtr, "1")).toEqual(["A"]);
    expect(nextChars(kmbMtr, "k1")).toEqual(["4"]); // case-insensitive
    expect(nextChars(kmbMtr, "1A")).toEqual([]);
    expect(nextChars(kmbMtr, "9")).toEqual([]);
  });

  it("drops '-'", () => {
    expect(nextChars(kmbMtr, "N")).toEqual([]);
  });

  it("filters by operator", () => {
    expect(nextChars(buildRouteTrie(routes, ["gmb"]), "")).toEqual(["2"]);
  });

  it("tolerates a missing route list", () => {
    expect(nextChars(buildRouteTrie(null, ["kmb"]), "")).toEqual([]);
  });
});
