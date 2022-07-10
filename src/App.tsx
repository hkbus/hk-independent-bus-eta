import React, { useContext, useMemo } from "react";
import loadable from "@loadable/component";
import "./App.css";
import "leaflet/dist/leaflet.css";
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { PaletteMode } from "@mui/material";
import AppContext from "./AppContext";
import Main from "./components/layout/Main";
import Home from "./pages/Home";
import { SearchContextProvider } from "./SearchContext";
import reportWebVitals, { sendToGoogleAnalytics } from "./reportWebVitals";

const RouteEta = loadable(() => import("./pages/RouteEta"));
const RouteBoard = loadable(() => import("./pages/RouteBoard"));
const RouteSearch = loadable(() => import("./pages/RouteSearch"));
const Settings = loadable(() => import("./pages/Settings"));
const PrivacyPolicy = loadable(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = loadable(() => import("./pages/TermsAndConditions"));

const App = () => {
  const { colorMode, analytics } = useContext(AppContext);

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  analytics && reportWebVitals(sendToGoogleAnalytics);

  const theme = useMemo(() => {
    return createTheme(getThemeTokens(colorMode), [colorMode]);
  }, [colorMode]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CacheProvider value={emotionCache}>
          <Router>
            <SearchContextProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/zh" />} />
                <Route path="/:lang" element={<Main />}>
                  <Route path={`route/:id`} element={<RouteEta />} />
                  <Route path={`route/:id/:panel`} element={<RouteEta />} />
                  <Route path={`settings`} element={<Settings />} />
                  <Route path={`board`} element={<RouteBoard />} />
                  <Route path={`search`} element={<RouteSearch />} />
                  <Route path={`privacy`} element={<PrivacyPolicy />} />
                  <Route path={`terms`} element={<TermsAndConditions />} />
                  <Route path={``} element={<Home />} />
                </Route>
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

const getThemeTokens = (mode: PaletteMode) => ({
  typography: {
    fontFamily: "'Chiron Sans HK Pro WS', sans-serif",
  },
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // light mode
          background: {
            default: "#fedb00",
          },
          primary: {
            main: "#fedb00", // yellow
          },
        }
      : {
          //dark mode
          primary: {
            main: "#fedb00", // yellow
          },
          background: {
            default: "#000",
          },
        }),
  },
  elements: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          userSelect: "none",
        },
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
