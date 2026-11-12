// Developer option: stay on the test (alpha / dev) site until turned off.
// The flag lives on the STABLE origin (localStorage is per-origin) and is set/cleared via ?site=test|stable.
export const STABLE_SITE = "https://app.hkbus.app";
export const TEST_SITE: string = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_SITE_URL || "https://alpha.hkbus.app" // dev builds may override via .env
  : "https://alpha.hkbus.app";

const KEY = "stayOnTest";
const inNativeApp = () => !!(window as any).ReactNativeWebView;

export const siteSwitchAvailable = () => !inNativeApp();
export const onTestSite = () => location.origin === new URL(TEST_SITE).origin;

/** Pure: returns the URL to redirect to on boot, or null. Mutates storage per ?site param. */
export const bootRedirectTarget = (
  loc: Pick<Location, "origin" | "pathname" | "search" | "hash">,
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  native = false
): string | null => {
  if (native || loc.origin !== STABLE_SITE) return null;
  try {
    const p = new URLSearchParams(loc.search).get("site");
    if (p === "test") storage.setItem(KEY, "1");
    if (p === "stable") storage.removeItem(KEY);
    if (!storage.getItem(KEY)) return null;
    const search = p ? "" : loc.search; // ponytail: drops other query params when ?site is used
    return TEST_SITE + loc.pathname + search + loc.hash;
  } catch {
    return null; // storage unavailable: never block loading
  }
};

export const bootSiteRedirect = () => {
  const t = bootRedirectTarget(location, localStorage, inNativeApp());
  if (t) location.replace(t);
  else if (new URLSearchParams(location.search).get("site"))
    history.replaceState(null, "", location.pathname + location.hash);
};

export const switchSite = () => {
  const { pathname, search, hash } = location;
  if (onTestSite()) {
    location.href = `${STABLE_SITE}${pathname}?site=stable${hash}`; // clears the flag on the stable origin
    return;
  }
  if (location.origin === STABLE_SITE) {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore: the one-time jump below still works */
    }
  }
  location.href = TEST_SITE + pathname + search + hash; // straight to the test site, also from localhost/dev
};
