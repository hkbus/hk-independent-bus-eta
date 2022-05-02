const fs = require("fs");
const request = require("request");

host = "https://" + fs.readFileSync("public/CNAME", "utf8");

// constant pages
content = [``, "/search", "/settings"];
pages = [
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
request(
  "https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json",
  (e, r, b) => {
    var routeList = JSON.parse(b)["routeList"];
    zhRoutes = Object.entries(routeList).map(
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
    enRoutes = Object.entries(routeList).map(
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
  }
);
