import React, { Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { DbProvider } from "./DbContext";
import { AppContextProvider } from "./AppContext";
import "./i18n";
import { DatabaseType, fetchDbFunc } from "./db";
import ErrorBoundary from "./ErrorBoundary";
import { CollectionContextProvider } from "./CollectionContext";
import { ReactNativeContextProvider } from "./ReactNativeContext";
import { EmotionContextProvider } from "./EmotionContext";
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

  const fetchDb = fetchDbFunc();
  const allPromises = Promise.all([fetchDb]);

  // remove prerendered style
  if (prerenderStyle instanceof HTMLStyleElement) {
    // @ts-expect-error root is always here
    document.getElementById("root").innerHTML = "";
    prerenderStyle.innerHTML = "";
  }
  const Container = () => {
    const [state, setState] = useState<DatabaseType | null>(null);

    useEffect(() => {
      allPromises.then(([fetchDbResult]) => {
        setState(fetchDbResult);
      });
    }, []);

    if (state === null) return <></>;

    return (
      <ErrorBoundary>
        <DbProvider initialDb={state}>
          <CollectionContextProvider>
            <AppContextProvider>
              <EmotionContextProvider>
                <ReactNativeContextProvider>
                  <Suspense fallback={null}>
                    <App />
                  </Suspense>
                </ReactNativeContextProvider>
              </EmotionContextProvider>
            </AppContextProvider>
          </CollectionContextProvider>
        </DbProvider>
      </ErrorBoundary>
    );
  };

  const root = createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <Container />
    </React.StrictMode>
  );
}
