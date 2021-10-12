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
  Redirect,
  Switch,
  Route,
  useRouteMatch,
} from "react-router-dom";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { Container, CssBaseline, PaletteMode } from "@mui/material";
import { styled } from "@mui/material/styles";
import AppContext from "./AppContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import RouteEta from "./pages/RouteEta";
import { SearchContextProvider } from "./SearchContext";
import toast, { Toaster } from "react-hot-toast";
const RouteBoard = loadable(() => import("./pages/RouteBoard"));
const RouteSearch = loadable(() => import("./pages/RouteSearch"));
const Settings = loadable(() => import("./pages/Settings"));

const PageSwitch = () => {
  const { path } = useRouteMatch();
  return (
    <SearchContextProvider>
      <Switch>
        <Route path={`${path}/route/:id/:panel?`} component={RouteEta} />
        <Route path={`${path}/settings`} component={Settings} />
        <Route path={`${path}/board`} component={RouteBoard} />
        <Route path={`${path}/search`} component={RouteSearch} />
        <Route path={`${path}`} component={Home} />
      </Switch>
    </SearchContextProvider>
  );
};

const inBadWeather = () => {
  fetch(
    "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en"
  ).then((response) => {
    if (response.ok) {
      let blob = response.text();
      blob.then((data) => {
        console.log("checking weather");
        const text = JSON.stringify(data);
        const adverseCode =
          /((\\"code\\":\\")+(TC8\w+|TC9|TC10|WRAINR|WRAINB))/gi;
        const match = text.match(adverseCode);
        if (match) {
          toast(
            (t) => (
              <span>
                Services may be impacted by bad weather.
                <br />
                Check{" "}
                <a href="https://www.td.gov.hk/en/special_news/spnews.htm">
                  offical announcements
                </a>{" "}
                for more info.
                <button onClick={() => toast.dismiss(t.id)}>X</button>
              </span>
            ),
            { duration: Infinity, id: "bad_weather" }
          );
        }
      });
    }
  });
};

const App = () => {
  const { colorMode } = useContext(AppContext);
  const theme = useMemo(() => {
    return createTheme(getThemeTokens(colorMode), [colorMode]);
  }, [colorMode]);
  inBadWeather();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CacheProvider value={emotionCache}>
          <AppContainer
            maxWidth="xs"
            disableGutters
            className={classes.container}
          >
            <Router>
              <Route exact path="/">
                <Redirect to="/zh" />
              </Route>
              <Route path="/:lang">
                <CssBaseline />
                <Header />
                <Toaster />
                <PageSwitch />
                <Footer />
              </Route>
            </Router>
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
    fontFamily: "Noto Sans TC, Chivo, sans-serif",
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
        },
      },
    },
  },
});
