import React, { useEffect } from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { useContext, useMemo } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import AppContext from "./context/AppContext";
import { SearchContextProvider } from "./SearchContext";
import Root from "./components/layout/Root";
import RedirectPage from "./pages/RedirectPagePage";
import reportWebVitals, { sendToGoogleAnalytics } from "./reportWebVitals";
import useLanguage from "./hooks/useTranslation";
import StopEtaListPage from "./pages/StopEtaListPage";
import { DEFAULT_THEME_ID, getThemeTokens, resolveThemeColors } from "./theme";

const HomePage = React.lazy(() => import("./pages/HomePage"));
const RouteEtaPage = React.lazy(() => import("./pages/RouteEtaPage"));
const BookmarkedStopPage = React.lazy(
  () => import("./pages/BookmarkedStopPage")
);
const RouteBoardPage = React.lazy(() => import("./pages/RouteBoardPage"));
const RouteSearchPage = React.lazy(() => import("./pages/RouteSearchPage"));
const NoticePage = React.lazy(() => import("./pages/NoticePage"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const EmotionPage = React.lazy(() => import("./pages/EmotionPage"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsAndConditionsPage = React.lazy(
  () => import("./pages/TermsAndConditionsPage")
);
const SupportPage = React.lazy(() => import("./pages/SupportPage"));
const DataImportPage = React.lazy(() => import("./pages/DataImportPage"));
const DataExportPage = React.lazy(() => import("./pages/DataExportPage"));

const App = () => {
  const { analytics, colorMode, fontSize, themeId, customTheme } =
    useContext(AppContext);
  const language = useLanguage();

  const themeColors = useMemo(
    () => resolveThemeColors(themeId, customTheme)[colorMode],
    [themeId, customTheme, colorMode]
  );

  const theme = useMemo(() => {
    return createTheme(
      getThemeTokens(
        colorMode,
        fontSize,
        themeColors,
        themeId === DEFAULT_THEME_ID
      )
    );
  }, [colorMode, fontSize, themeColors, themeId]);

  useEffect(() => {
    // keep the browser / PWA chrome in sync with a non-classic background
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        themeId === DEFAULT_THEME_ID ? "#000000" : themeColors.background
      );
  }, [themeId, themeColors.background]);

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
              <Routes>
                <Route path="/" element={<Navigate to={`/${language}`} />} />
                <Route path="/:lang" element={<Root />}>
                  <Route
                    path={`collections/:collectionName`}
                    element={<HomePage />}
                  />
                  <Route
                    path={`route/:id/:panel?`}
                    element={<RouteEtaPage />}
                  />
                  <Route path={`stop/:stopId`} element={<StopEtaListPage />} />
                  <Route path={`settings`} element={<SettingsPage />} />
                  <Route path={"notice"} element={<NoticePage />} />
                  <Route path={`import/:data?`} element={<DataImportPage />} />
                  <Route path={`export`} element={<DataExportPage />} />
                  <Route path={`board`} element={<RouteBoardPage />} />
                  <Route path={`stops`} element={<BookmarkedStopPage />} />
                  <Route path={`search`} element={<RouteSearchPage />} />
                  <Route path="emotion/:tab?" element={<EmotionPage />} />
                  <Route path={`privacy`} element={<PrivacyPolicyPage />} />
                  <Route path={`terms`} element={<TermsAndConditionsPage />} />
                  <Route path={`support`} element={<SupportPage />} />
                  <Route
                    path={"patreon"}
                    element={
                      <RedirectPage url="https://www.patreon.com/hkbus" />
                    }
                  />
                  <Route path={``} element={<HomePage />} />
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
                  element={
                    <RedirectPage url="https://t.me/+T245uB32DeNlNjJl" />
                  }
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
              </Routes>
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
