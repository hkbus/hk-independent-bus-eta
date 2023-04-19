const fs = require("fs");

const host = "https://" + fs.readFileSync("public/CNAME", "utf8");

// constant pages
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

// route pages
fetch("https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json")
  .then((res) => res.json())
  .then((res) => {
    const { routeList } = res;
    const zhRoutes = Object.entries(routeList)
      .filter(([id, {stops}]) =>   
        Object.values(stops)[0].length > 0
      )
      .map(
        (route) =>
          `/zh/route/${route[0]
            .replace(/\+/g, "-")
            .replace(/ /g, "-")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29")
            .replace(/／/g, "%EF%BC%8F")
            .replace(/'/g, "%27")
            .replace(/,/g, "%2C")
            .toLowerCase()}`
      );
    const enRoutes = Object.entries(routeList)
      .filter(([id, {stops}]) =>   
        Object.values(stops)[0].length > 0
      )
      .map(
        (route) =>
          `/en/route/${route[0]
            .replace(/\+/g, "-")
            .replace(/ /g, "-")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29")
            .replace(/／/g, "%EF%BC%8F")
            .replace(/'/g, "%27")
            .replace(/,/g, "%2C")
            .toLowerCase()}`
      );

    // write to file
    fs.writeFileSync(
      "build/sitemap.txt",
      []
        .concat(pages, zhRoutes, enRoutes)
        .map((p) => `${host}${p}`)
        .join("\n")
    );
    fs.writeFileSync(
      ".rsp.json",
      JSON.stringify({
        port: 3001,
        routes: [].concat(pages, zhRoutes, enRoutes),
      })
    );
  });
