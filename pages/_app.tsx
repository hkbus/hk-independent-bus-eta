import type { AppProps } from "next/app";
import "../src/App.css";
import "leaflet/dist/leaflet.css";
import { Container, CssBaseline } from "@mui/material";
import { styled } from "@mui/material/styles";
import Header from "../src/components/layout/Header";
import Footer from "../src/components/layout/Footer";
import { SearchContextProvider } from "../src/SearchContext";
import { useEffect, useState } from "react";
import { AppContextProvider } from "../src/AppContext";
import { fetchDbFunc } from "../src/db";
import type { DatabaseType } from "../src/db";
import { Workbox } from "workbox-window";
import Head from "next/head";
import { appWithTranslation } from "next-i18next";
import { EmotionCache } from "@emotion/react";
import createEmotionCache from "../src/createEmotionCache";
import React from "react";
import type { WarnUpMessageData } from "../src/typing";
// Client-side cache, shared for the whole session of the user in the browser.

const clientSideEmotionCache = createEmotionCache();
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}
const App = (props: MyAppProps) => {
  const { Component, pageProps } = props;
  const [state, setState] = useState<{
    initialized: boolean;
    workbox?: Workbox;
    db: DatabaseType;
  }>({
    initialized: false,
    workbox: typeof window !== "undefined" ? window.workbox : undefined,
    db: {
      schemaVersion: "",
      versionMd5: "",
      updateTime: 0,
    },
  });
  useEffect(() => {
    (async () => {
      const fetchDbResult = await fetchDbFunc();
      setState((state) => ({ ...state, initialized: true, db: fetchDbResult }));
    })().catch((e) => console.error(e));
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;
      wb.register();
      wb.addEventListener("activated", (e) => {
        if (e.isUpdate ?? false) {
          const message: WarnUpMessageData = {
            type: "WARN_UP_MAP_CACHE",
            retinaDisplay:
              (window.devicePixelRatio ||
                // @ts-ignore: Property does not exist on type 'Screen'.
                window.screen.deviceXDPI / window.screen.logicalXDPI) > 1,
            zoomLevels: [14, 15],
          };
          wb.messageSW(message);
        }
      });
    }
  }, []);
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0, viewport-fit=cover"
        />
      </Head>
      <AppContextProvider
        initialDb={state.db}
        workbox={state.workbox}
        emotionCache={props.emotionCache ?? clientSideEmotionCache}
      >
        <AppContainer
          maxWidth="xs"
          disableGutters
          className={classes.container}
        >
          <SearchContextProvider>
            <CssBaseline />
            <Header />
            <Component {...pageProps} />
            <Footer />
          </SearchContextProvider>
        </AppContainer>
      </AppContextProvider>
    </>
  );
};

export default appWithTranslation(App);

const PREFIX = "app";

const classes = {
  container: `${PREFIX}-container`,
};

const AppContainer = styled(Container)(({ theme }) => ({
  [`&.${classes.container}`]: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
}));
