import React, { useEffect, useState } from "react";
import loadable from "@loadable/component";
import { createRoot } from "react-dom/client";
import "./index.css";
import { DbProvider } from "./DbContext";
import { AppContextProvider } from "./AppContext";
import "./i18n";
import { fetchDbFunc } from "./db";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import type { WarnUpMessageData } from "./typing";
import ErrorBoundary from "./ErrorBoundary";
import { CollectionContextProvider } from "./CollectionContext";
const App = loadable(() => import("./App"));

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
  const workboxPromise = serviceWorkerRegistration.register({
    onUpdate: (workbox, skipWaiting) => {
      skipWaiting();
      const message: WarnUpMessageData = {
        type: "WARN_UP_MAP_CACHE",
        retinaDisplay:
          (window.devicePixelRatio ||
            // @ts-ignore: Property does not exist on type 'Screen'.
            window.screen.deviceXDPI / window.screen.logicalXDPI) > 1,
        zoomLevels: [14, 15],
      };
      workbox.messageSW(message);
    },
  });
  const fetchDb = fetchDbFunc();
  const allPromise = Promise.all([fetchDb, workboxPromise]);

  // remove prerendered style
  if (prerenderStyle instanceof HTMLStyleElement) {
    document.getElementById("root").innerHTML = "";
    prerenderStyle.innerHTML = "";
  }
  const Container = () => {
    const [state, setState] = useState({
      initialized: false,
      workbox: undefined,
      db: undefined,
    });

    useEffect(() => {
      allPromise.then(([fetchDbResult, workbox]) => {
        setState({ initialized: true, workbox: workbox, db: fetchDbResult });
      });
    }, []);

    if (!state.initialized) return <></>;

    return (
      <ErrorBoundary>
        <DbProvider initialDb={state.db}>
          <CollectionContextProvider>
            <AppContextProvider workbox={state.workbox}>
              <App />
            </AppContextProvider>
          </CollectionContextProvider>
        </DbProvider>
      </ErrorBoundary>
    );
  };

  const root = createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <Container />
    </React.StrictMode>
  );
}
