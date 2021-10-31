import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Leaflet from "leaflet";
import "./index.css";
import App from "./App";
import { DbProvider } from "./DbContext";
import { AppContextProvider } from "./AppContext";
import "./i18n";
import { fetchDbFunc } from "./db";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals, { sendToGoogleAnalytics } from "./reportWebVitals";
import type { WarnUpMessageData } from "./typing";

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
        retinaDisplay: Leaflet.Browser.retina,
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
      !canonicalLink.href.endsWith(window.location.pathname)) ||
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

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  //reportWebVitals(sendToGoogleAnalytics);
}
