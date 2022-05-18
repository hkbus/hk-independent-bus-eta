import React, { useEffect, useState } from "react";
import loadable from "@loadable/component";
import ReactDOM from "react-dom";
import "./index.css";
import { DbProvider } from "./DbContext";
import { AppContextProvider } from "./AppContext";
import "./i18n";
import { fetchDbFunc } from "./db";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import type { WarnUpMessageData } from "./typing";
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
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  let prerenderStyle = document.querySelector("style[prerender]");
  const workboxPromise = serviceWorkerRegistration.register({
    onUpdate: (workbox, skipWaiting, installingServiceWorker) => {
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
  if (
    process.env.NODE_ENV === "development" ||
    navigator.userAgent === "prerendering" ||
    window.location.pathname.includes("/board") ||
    window.location.pathname.includes("/search") ||
    window.location.pathname.includes("/settings") ||
    (canonicalLink instanceof HTMLAnchorElement &&
      !canonicalLink.getAttribute("href").endsWith(window.location.pathname)) ||
    true // mui v5 make class name not preserved, prerendering fails......
  ) {
    // remove prerendered style
    if (prerenderStyle instanceof HTMLStyleElement) {
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
          console.log(fetchDbResult);
          setState({ initialized: true, workbox: workbox, db: fetchDbResult });
        });
      }, []);
      if (!state.initialized) {
        return <></>;
      }
      return (
        <DbProvider initialDb={state.db}>
          <AppContextProvider workbox={state.workbox}>
            <App />
          </AppContextProvider>
        </DbProvider>
      );
    };
    ReactDOM.render(
      <React.StrictMode>
        <Container />
      </React.StrictMode>,
      document.getElementById("root")
    );
  } else {
    fetchDb.then((db) => {
      const Container = () => {
        const [state, setState] = useState({
          workbox: undefined,
        });
        useEffect(() => {
          workboxPromise.then((workbox) => {
            console.log(workbox);
            setState({ workbox: workbox });
          });
        }, []);
        return (
          <DbProvider initialDb={db}>
            <AppContextProvider workbox={state.workbox}>
              <App />
            </AppContextProvider>
          </DbProvider>
        );
      };
      // hydrate in production
      ReactDOM.hydrate(
        <React.StrictMode>
          <Container />
        </React.StrictMode>,
        document.getElementById("root"),
        () => {
          if (prerenderStyle instanceof HTMLStyleElement) {
            prerenderStyle.innerHTML = "";
          }
        }
      );
    });
  }
}
