import fs from "fs";

const host = "https://" + fs.readFileSync("public/CNAME", "utf8").trim();
const lastmod = new Date().toISOString().split("T")[0];

// Encode a raw route id into its URL slug. Kept identical to the form used
// for the canonical link in src/utils.ts so the sitemap and canonical agree.
const encodeRoute = (id) =>
  id
    .replace(/\+/g, "-")
    .replace(/ /g, "-")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/／/g, "%EF%BC%8F")
    .replace(/'/g, "%27")
    .replace(/,/g, "%2C")
    .toLowerCase();

// Paths (after the /{lang} segment) that exist in both languages.
const constantPaths = ["", "/board", "/privacy", "/terms", "/search"];

// Build one <url> block with self-referencing + alternate hreflang links so
// Google clusters the zh / en versions as one piece of content.
const urlEntry = (loc, alternates) => {
  const links = alternates
    .map(
      (a) =>
        `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`
    )
    .join("\n");
  return (
    `  <url>\n` +
    `    <loc>${loc}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `${links}\n` +
    `  </url>`
  );
};

// zh / en / x-default alternate set for a given pair of URLs.
const altSet = (zh, en) => [
  { lang: "zh-Hant", href: zh },
  { lang: "en", href: en },
  { lang: "x-default", href: zh },
];

// route pages
fetch("https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json")
  .then((res) => res.json())
  .then((res) => {
    const { routeList } = res;

    const liveRoutes = Object.entries(routeList).filter(
      ([, { stops }]) => Object.values(stops)[0].length > 0
    );

    // --- XML sitemap with hreflang alternates + lastmod ---------------------
    const entries = [];

    // Site root → x-default (Chinese).
    entries.push(
      urlEntry(`${host}/`, [
        { lang: "zh-Hant", href: `${host}/zh` },
        { lang: "en", href: `${host}/en` },
        { lang: "x-default", href: `${host}/zh` },
      ])
    );

    // Constant pages, paired across languages.
    for (const p of constantPaths) {
      const zh = `${host}/zh${p}`;
      const en = `${host}/en${p}`;
      const alts = altSet(zh, en);
      entries.push(urlEntry(zh, alts));
      entries.push(urlEntry(en, alts));
    }

    // Route pages, paired across languages.
    for (const [id] of liveRoutes) {
      const slug = encodeRoute(id);
      const zh = `${host}/zh/route/${slug}`;
      const en = `${host}/en/route/${slug}`;
      const alts = altSet(zh, en);
      entries.push(urlEntry(zh, alts));
      entries.push(urlEntry(en, alts));
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
      `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      `${entries.join("\n")}\n` +
      `</urlset>\n`;

    fs.writeFileSync("build/sitemap.xml", xml);

    // --- .rsp.json: list of routes for the pre-rendering step ---------------
    // Unchanged behaviour: the pre-render script reads these paths to know
    // which pages to snapshot.
    const pages = [
      "/",
      "/zh",
      "/en",
      "/en/board",
      "/zh/board",
      "/zh/privacy",
      "/en/privacy",
      "/en/terms",
      "/zh/terms",
      "/zh/search",
      "/en/search",
    ];
    const zhRoutes = liveRoutes.map(([id]) => `/zh/route/${encodeRoute(id)}`);
    const enRoutes = liveRoutes.map(([id]) => `/en/route/${encodeRoute(id)}`);

    fs.writeFileSync(
      ".rsp.json",
      JSON.stringify({
        port: 3001,
        routes: [].concat(pages, zhRoutes, enRoutes),
      })
    );
  });
