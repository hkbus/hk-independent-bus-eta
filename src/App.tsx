import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import loadable from "@loadable/component";
import { PaletteMode } from "@mui/material";
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import "leaflet/dist/leaflet.css";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import AppContext from "./AppContext";
import { SearchContextProvider } from "./SearchContext";
import Main from "./components/layout/Main";
import RedirectPage from "./pages/RedirectPage";
import reportWebVitals, { sendToGoogleAnalytics } from "./reportWebVitals";

const Home = loadable(() => import("./pages/Home"));
const RouteEta = loadable(() => import("./pages/RouteEta"));
const BookmarkedStop = loadable(() => import("./pages/BookmarkedStop"));
const RouteBoard = loadable(() => import("./pages/RouteBoard"));
const RouteSearch = loadable(() => import("./pages/RouteSearch"));
const Notice = loadable(() => import("./pages/Notice"));
const Settings = loadable(() => import("./pages/Settings"));
const PrivacyPolicy = loadable(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = loadable(() => import("./pages/TermsAndConditions"));
const Support = loadable(() => import("./pages/Support"));
const DataImport = loadable(() => import("./pages/DataImport"));
const DataExport = loadable(() => import("./pages/DataExport"));

const App = () => {
  const { analytics, colorMode, fontSize } = useContext(AppContext);
  const {
    i18n: { language },
  } = useTranslation();

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  analytics && reportWebVitals(sendToGoogleAnalytics);

  const theme = useMemo(() => {
    return createTheme(getThemeTokens(colorMode, fontSize), [colorMode]);
  }, [colorMode, fontSize]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CacheProvider value={emotionCache}>
          <Router>
            <SearchContextProvider>
              <Routes>
                <Route path="/" element={<Navigate to={`/${language}`} />} />
                <Route path="/:lang" element={<Main />}>
                  <Route
                    path={`collections/:collectionName`}
                    element={<Home />}
                  />
                  <Route path={`route/:id`} element={<RouteEta />} />
                  <Route path={`route/:id/:panel`} element={<RouteEta />} />
                  <Route path={`settings`} element={<Settings />} />
                  <Route path={"notice"} element={<Notice />} />
                  <Route path={`import/:data?`} element={<DataImport />} />
                  <Route path={`export`} element={<DataExport />} />
                  <Route path={`board`} element={<RouteBoard />} />
                  <Route path={`stops`} element={<BookmarkedStop />} />
                  <Route path={`search`} element={<RouteSearch />} />
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
              </Routes>
            </SearchContextProvider>
          </Router>
        </CacheProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;

const emotionCache = createCache({
  key: "hkbus",
  speedy: !(
    process.env.NODE_ENV === "development" ||
    navigator.userAgent === "prerendering"
  ),
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
