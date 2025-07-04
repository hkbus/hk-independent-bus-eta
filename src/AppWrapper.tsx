import React, { Suspense, useState, useEffect } from "react";
import "./index.css";
import { DbProvider } from "./context/DbContext";
import { AppContextProvider } from "./context/AppContext";
import "./i18n";
import { DatabaseType, fetchDbFunc } from "./db";
import ErrorFallback from "./ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { CollectionContextProvider } from "./CollectionContext";
import { ReactNativeContextProvider } from "./context/ReactNativeContext";
import { EmotionContextProvider } from "./context/EmotionContext";
import { PinnedEtasContextProvider } from "./context/PinnedEtasContext";
const App = React.lazy(() => import("./App"));

const AppWrapper = () => {
  const [state, setState] = useState<DatabaseType | null>(null);

  useEffect(() => {
    fetchDbFunc().then((db) => {
      setState(db);
    });
    document.querySelector<HTMLElement>("#launcher-loading")!.style.display =
      "none";
  }, []);

  if (state === null) return <></>;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DbProvider initialDb={state}>
        <CollectionContextProvider>
          <AppContextProvider>
            <EmotionContextProvider>
              <PinnedEtasContextProvider>
                <ReactNativeContextProvider>
                  <Suspense fallback={null}>
                    <App />
                  </Suspense>
                </ReactNativeContextProvider>
              </PinnedEtasContextProvider>
            </EmotionContextProvider>
          </AppContextProvider>
        </CollectionContextProvider>
      </DbProvider>
    </ErrorBoundary>
  );
};

export default AppWrapper;
