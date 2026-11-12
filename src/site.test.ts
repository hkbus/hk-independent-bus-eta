import { describe, expect, it } from "vitest";
import { bootRedirectTarget, STABLE_SITE, TEST_SITE } from "./site";

const mem = () => {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
};
const loc = (search = "") => ({
  origin: STABLE_SITE,
  pathname: "/en/route/1",
  search,
  hash: "#x",
});

describe("bootRedirectTarget", () => {
  it("sticks after ?site=test, clears on ?site=stable", () => {
    const s = mem();
    expect(bootRedirectTarget(loc("?site=test"), s)).toBe(
      TEST_SITE + "/en/route/1#x"
    );
    expect(bootRedirectTarget(loc(), s)).toBe(TEST_SITE + "/en/route/1#x");
    expect(bootRedirectTarget(loc("?site=stable"), s)).toBeNull();
    expect(bootRedirectTarget(loc(), s)).toBeNull();
  });
  it("never redirects off the stable origin or in native", () => {
    const s = mem();
    s.setItem("stayOnTest", "1");
    expect(bootRedirectTarget({ ...loc(), origin: TEST_SITE }, s)).toBeNull();
    expect(bootRedirectTarget(loc(), s, true)).toBeNull();
  });
});
