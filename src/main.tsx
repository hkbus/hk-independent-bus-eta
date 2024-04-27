import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n";
import AppWrapper from "./AppWrapper";

const isHuman = () => {
  const agents = [
    "googlebot",
    "bingbot",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "facebot",
    "ia_archiver",
    "sitecheckerbotcrawler",
    "chrome-lighthouse",
  ];
  return !navigator.userAgent.match(new RegExp(agents.join("|"), "i"));
};

// content is render only for human
if (isHuman()) {
  // performance consideration
  // the app is highly orientated by the routes data
  // fetching should be done to avoid unnecessary rendering
  // Target: render only if development or prerendering or in registered app or lazy loading page
  const prerenderStyle = document.querySelector("style[prerender]");

  // remove prerendered style
  if (prerenderStyle instanceof HTMLStyleElement) {
    document.getElementById("root")!.innerHTML = "";
    prerenderStyle.innerHTML = "";
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  );
}
