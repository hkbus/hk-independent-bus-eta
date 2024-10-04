import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import "./i18n";
import AppWrapper from "./AppWrapper";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from "react-router-dom";

// Copied from https://docs.sentry.io/platforms/javascript/guides/react/#configure
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration()
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 0.1,

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost"], // FIXME: See if we need to include additional hosts here

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
const App = React.lazy(() => import("./App"));

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
