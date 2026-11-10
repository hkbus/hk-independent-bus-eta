import { describe, expect, it } from "vitest";
import {
  addItem,
  duplicateCollection,
  moveBetween,
  moveBetweenAt,
  moveWithin,
  removeItem,
  sanitizeCollections,
} from "./collectionOps";

const c = (name: string, list: string[]) => ({ name, list, schedules: [] });

describe("collectionOps", () => {
  it("addItem ignores duplicates", () => {
    expect(addItem(c("a", ["1/1"]), "1/1").list).toEqual(["1/1"]);
    expect(addItem(c("a", ["1/1"]), "2/1").list).toEqual(["1/1", "2/1"]);
  });
  it("removeItem removes only that item", () => {
    expect(removeItem(c("a", ["1/1", "2/1"]), "1/1").list).toEqual(["2/1"]);
  });
  it("moveWithin reorders, clamps, ignores bad index", () => {
    expect(moveWithin(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveWithin(["a", "b", "c"], 2, -5)).toEqual(["c", "a", "b"]);
    expect(moveWithin(["a"], 3, 0)).toEqual(["a"]);
  });
  it("moveBetween moves and dedupes", () => {
    const r = moveBetween([c("a", ["x", "y"]), c("b", ["y"])], "y", 0, 1);
    expect(r[0].list).toEqual(["x"]);
    expect(r[1].list).toEqual(["y"]);
  });
  it("duplicateCollection gives unique names and deep copy", () => {
    const r = duplicateCollection([c("a", ["x"]), c("a copy", [])], 0);
    expect(r.map((x) => x.name)).toEqual(["a", "a copy 2", "a copy"]);
    expect(r[1].list).not.toBe(r[0].list);
  });
  it("sanitizeCollections drops garbage", () => {
    expect(sanitizeCollections("oops")).toEqual([]);
    const r = sanitizeCollections([
      { name: "ok", list: ["1/1", 5] },
      { name: 3 },
      null,
    ]);
    expect(r).toEqual([{ name: "ok", list: ["1/1"], schedules: [] }]);
  });
  it("moveBetweenAt inserts at index, clamps, and never drops an item on duplicate", () => {
    const cs = [c("a", ["1/1", "2/1"]), c("b", ["3/1", "4/1"])];
    expect(moveBetweenAt(cs, "1/1", 0, 1, 1)[1].list).toEqual([
      "3/1",
      "1/1",
      "4/1",
    ]);
    expect(moveBetweenAt(cs, "1/1", 0, 1, 1)[0].list).toEqual(["2/1"]);
    expect(moveBetweenAt(cs, "1/1", 0, 1, 99)[1].list).toEqual([
      "3/1",
      "4/1",
      "1/1",
    ]);
    const dup = [c("a", ["1/1"]), c("b", ["1/1"])];
    expect(moveBetweenAt(dup, "1/1", 0, 1, 0)).toBe(dup);
    expect(moveBetweenAt(cs, "9/9", 0, 1, 0)).toBe(cs);
  });
});
