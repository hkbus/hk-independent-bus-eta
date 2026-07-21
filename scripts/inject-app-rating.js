import fs from "fs";

// Injects the current App Store rating into the site-wide JSON-LD
// (WebApplication.aggregateRating) of the built index.html, so the structured
// data stays fresh on every deploy instead of being hard-coded.
//
// Runs AFTER `vite build` (build/index.html must exist) and BEFORE
// pre-rendering, so every prerendered route page inherits the updated value.
// Fails soft: any network / parse problem leaves the hard-coded fallback in
// index.html untouched, so a build never breaks because Apple is unreachable.

const APP_ID = "1612184906";
const COUNTRY = "hk"; // storefront whose ratings to read (matches the /hk/ store link)
const BUILD_HTML = "build/index.html";

// Match the first site-wide ld+json block (the per-route one carries an
// id="route-jsonld" attribute, so this pattern skips it).
const BLOCK_RE =
  /<script type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/;

const round1 = (n) => (Math.round(n * 10) / 10).toString();

async function fetchRating() {
  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${APP_ID}&country=${COUNTRY}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const app = json?.results?.[0];
  if (!app) throw new Error("empty results");
  return { value: app.averageUserRating, count: app.userRatingCount };
}

async function main() {
  if (!fs.existsSync(BUILD_HTML)) {
    console.warn(`[inject-app-rating] ${BUILD_HTML} not found; skipping.`);
    return;
  }

  let rating;
  try {
    rating = await fetchRating();
  } catch (err) {
    console.warn(
      `[inject-app-rating] could not fetch rating; keeping fallback. ${err}`
    );
    return;
  }

  if (!rating.value || !rating.count) {
    console.warn(
      "[inject-app-rating] rating value/count missing or zero; keeping fallback."
    );
    return;
  }

  const html = fs.readFileSync(BUILD_HTML, "utf-8");
  const m = html.match(BLOCK_RE);
  if (!m) {
    console.warn("[inject-app-rating] site-wide JSON-LD not found; skipping.");
    return;
  }

  let data;
  try {
    data = JSON.parse(m[1]);
  } catch (err) {
    console.warn(`[inject-app-rating] JSON-LD parse failed; skipping. ${err}`);
    return;
  }

  const webApp = (data["@graph"] || []).find(
    (n) => n["@type"] === "WebApplication"
  );
  if (!webApp) {
    console.warn("[inject-app-rating] WebApplication node not found; skipping.");
    return;
  }

  webApp.aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: round1(rating.value),
    ratingCount: String(rating.count),
    bestRating: "5",
    worstRating: "1",
  };

  // Re-indent to sit nicely under the two-space <head> nesting.
  const body = JSON.stringify(data, null, 2).replace(/\n/g, "\n      ");
  const block = `<script type="application/ld+json">\n      ${body}\n    </script>`;

  fs.writeFileSync(BUILD_HTML, html.replace(BLOCK_RE, block), "utf-8");
  console.log(
    `[inject-app-rating] set aggregateRating to ${round1(rating.value)} (${rating.count} ratings, ${COUNTRY}).`
  );
}

main();
