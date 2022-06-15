import React, { Fragment, useContext, useMemo } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { Container, CssBaseline, PaletteMode } from "@mui/material";
import { styled } from "@mui/material/styles";
import AppContext from "./AppContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import { SearchContextProvider } from "./SearchContext";
import reportWebVitals, { sendToGoogleAnalytics } from "./reportWebVitals";

const RouteEta = React.lazy(() => import("./pages/RouteEta"));
const RouteBoard = React.lazy(() => import("./pages/RouteBoard"));
const RouteSearch = React.lazy(() => import("./pages/RouteSearch"));
const Settings = React.lazy(() => import("./pages/Settings"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = React.lazy(
  () => import("./pages/TermsAndConditions")
);

const PageSwitch = () => {
  return (
    <SearchContextProvider>
      <Outlet />
    </SearchContextProvider>
  );
};

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
          <AppContainer
            maxWidth="xs"
            disableGutters
            className={classes.container}
          >
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/zh" replace />}></Route>
                <Route
                  path="/:lang"
                  element={
                    <Fragment>
                      <CssBaseline />
                      <Header />
                      <PageSwitch />
                      <Footer />
                    </Fragment>
                  }
                >
                  <Route path={`route/:id/`}>
                    <Route path={`:panel`} element={<RouteEta />} />
                    <Route index element={<RouteEta />} />
                  </Route>
                  <Route path={`settings`} element={<Settings />} />
                  <Route path={`board`} element={<RouteBoard />} />
                  <Route path={`search`} element={<RouteSearch />} />
                  <Route path={`privacy`} element={<PrivacyPolicy />} />
                  <Route path={`terms`} element={<TermsAndConditions />} />
                  <Route index element={<Home />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AppContainer>
        </CacheProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;

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
  components: {
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
        "&::-webkit-scrollbar": {
          width: 4,
          height: 4,
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#3f3f3f",
          borderRadius: 6,
        },
      },
    },
  },
});
