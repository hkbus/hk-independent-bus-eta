import React, { useEffect } from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { PaletteMode } from "@mui/material";
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import "leaflet/dist/leaflet.css";
import { useContext, useMemo } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import * as Sentry from "@sentry/react";

import "./App.css";
import AppContext from "./context/AppContext";
import { SearchContextProvider } from "./SearchContext";
import Root from "./components/layout/Root";
import RedirectPage from "./pages/RedirectPage";
import reportWebVitals, { sendToGoogleAnalytics } from "./reportWebVitals";
import useLanguage from "./hooks/useTranslation";

const Home = React.lazy(() => import("./pages/Home"));
const RouteEta = React.lazy(() => import("./pages/RouteEta"));
const BookmarkedStop = React.lazy(() => import("./pages/BookmarkedStop"));
const RouteBoard = React.lazy(() => import("./pages/RouteBoard"));
const RouteSearch = React.lazy(() => import("./pages/RouteSearch"));
const Notice = React.lazy(() => import("./pages/Notice"));
const Settings = React.lazy(() => import("./pages/Settings"));
const EmotionPage = React.lazy(() => import("./pages/EmotionPage"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = React.lazy(
  () => import("./pages/TermsAndConditions")
);
const Support = React.lazy(() => import("./pages/Support"));
const DataImport = React.lazy(() => import("./pages/DataImport"));
const DataExport = React.lazy(() => import("./pages/DataExport"));

const App = () => {
  // Integration with reference to https://docs.sentry.io/platforms/javascript/guides/react/features/react-router/#usage-with-routes--component
  const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

  const { analytics, colorMode, fontSize } = useContext(AppContext);
  const language = useLanguage();

  const theme = useMemo(() => {
    return createTheme(getThemeTokens(colorMode, fontSize), [colorMode]);
  }, [colorMode, fontSize]);

  useEffect(() => {
    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    if (analytics) reportWebVitals(sendToGoogleAnalytics);
  }, [analytics]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CacheProvider value={emotionCache}>
          <SearchContextProvider>
            <Router>
              <SentryRoutes>
                <Route path="/" element={<Navigate to={`/${language}`} />} />
                <Route path="/:lang" element={<Root />}>
                  <Route
                    path={`collections/:collectionName`}
                    element={<Home />}
                  />
                  <Route path={`route/:id/:panel?`} element={<RouteEta />} />
                  <Route path={`settings`} element={<Settings />} />
                  <Route path={"notice"} element={<Notice />} />
                  <Route path={`import/:data?`} element={<DataImport />} />
                  <Route path={`export`} element={<DataExport />} />
                  <Route path={`board`} element={<RouteBoard />} />
                  <Route path={`stops`} element={<BookmarkedStop />} />
                  <Route path={`search`} element={<RouteSearch />} />
                  <Route path="emotion/:tab?" element={<EmotionPage />} />
                  <Route path={`privacy`} element={<PrivacyPolicy />} />
                  <Route path={`terms`} element={<TermsAndConditions />} />
                  <Route path={`support`} element={<Support />} />
                  <Route
                    path={"patreon"}
                    element={
                      <RedirectPage url="https://www.patreon.com/hkbus" />
                    }
                  />
                  <Route path={``} element={<Home />} />
                </Route>
                <Route
                  path="/android"
                  element={
                    <RedirectPage url="https://play.google.com/store/apps/details?id=app.hkbus" />
                  }
                />
                <Route
                  path="/ios"
                  element={
                    <RedirectPage url="https://apps.apple.com/hk/app/hkbus-app-%E5%B7%B4%E5%A3%AB%E5%88%B0%E7%AB%99%E9%A0%90%E5%A0%B1/id1612184906" />
                  }
                />
                <Route
                  path="/wear"
                  element={
                    <RedirectPage url="https://play.google.com/store/apps/details?id=com.loohp.hkbuseta" />
                  }
                />
                <Route
                  path="/watch"
                  element={
                    <RedirectPage url="https://apps.apple.com/us/app/hk-bus-eta-watchos/id6475241017" />
                  }
                />
                <Route
                  path="/telegram"
                  element={<RedirectPage url="https://t.me/hkbusapp" />}
                />
                <Route
                  path="/instagram"
                  element={
                    <RedirectPage url="https://instagram.com/hkbus.app" />
                  }
                />
                <Route
                  path="/source-code"
                  element={
                    <RedirectPage url="https://github.com/hkbus/hk-independent-bus-eta/" />
                  }
                />
                <Route
                  path="/faq"
                  element={
                    <RedirectPage url="https://github.com/hkbus/hk-independent-bus-eta/wiki/%E5%B8%B8%E8%A6%8B%E5%95%8F%E9%A1%8C-FAQ" />
                  }
                />
              </SentryRoutes>
            </Router>
          </SearchContextProvider>
        </CacheProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;

const emotionCache = createCache({
  key: "hkbus",
  speedy: !(import.meta.env.DEV || navigator.userAgent === "prerendering"),
});

declare module "@mui/material/styles" {
  interface TypeBackground {
    contrast: string;
  }
}

const getThemeTokens = (mode: PaletteMode, fontSize: number) => ({
  typography: {
    fontFamily: "'Chiron Hei HK WS'",
    h6: {
      fontWeight: 700,
    },
    fontSize,
  },
  avatar: {
    default: {
      color: mode === "light" ? "#000" : "white",
    },
  },
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // light mode
          background: {
            default: "#fedb00", // yellow
            contrast: "rgba(255, 255, 255, 0.12)",
          },
          primary: {
            main: "#444",
            contrastText: "rgba(0, 0, 0, 0.12)",
          },
          warning: {
            main: "#3285e3",
          },
          secondary: {
            main: "#000",
          },
        }
      : {
          //dark mode
          background: {
            default: "#000",
            contrast: "rgba(255, 255, 255, 0.12)",
          },
          primary: {
            main: "#fedb00", // yellow
            contrastText: "#000",
          },
          warning: {
            main: "#fedb00",
          },
          secondary: {
            main: "#fedb00",
          },
        }),
  },
  elements: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontSize: "0.875rem",
          lineHeight: 1.43,
          scrollbarColor: "#3f3f3f",
          scrollbarWidth: "thin",
        },
      },
    },
  },
});
