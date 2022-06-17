import React, { useEffect, useCallback, useContext, useMemo } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Input,
  Toolbar,
  Typography,
  Button,
  SxProps,
  Theme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link, useLocation, useHistory, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { vibrate, checkMobile } from "../../utils";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useWeatherCode, WeatherIcons } from "../Weather";

const Header = () => {
  const {
    searchRoute,
    setSearchRoute,
    db: { routeList },
    colorMode,
    vibrateDuration,
    geoPermission,
    updateGeolocation,
  } = useContext(AppContext);
  const { path } = useRouteMatch();
  const { t, i18n } = useTranslation();
  let location = useLocation();
  const history = useHistory();
  const weatherCodes = useWeatherCode();

  const handleLanguageChange = (lang) => {
    vibrate(vibrateDuration);
    history.replace(location.pathname.replace("/" + i18n.language, "/" + lang));
    i18n.changeLanguage(lang);
  };

  const relocateGeolocation = useCallback(() => {
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          updateGeolocation({ lat: latitude, lng: longitude });
        }
      );
    } catch (e) {
      console.log("error in getting location");
    }
  }, [updateGeolocation]);

  const handleKeydown = useCallback(
    ({ key, ctrlKey, altKey, metaKey, target }: KeyboardEvent) => {
      // escape if key is functional
      if (ctrlKey || altKey || metaKey) return;
      // escape if any <input> has already been focused
      if ((target as HTMLElement).tagName.toUpperCase() === "INPUT") return;
      if ((target as HTMLElement).tagName.toUpperCase() === "TEXTAREA") return;

      if (key === "Escape") {
        setSearchRoute("");
      } else if (key === "Backspace") {
        setSearchRoute(searchRoute.slice(0, -1));
      } else if (key.length === 1) {
        setSearchRoute(searchRoute + key);
        history.replace(`/${i18n.language}/board`);
      }
    },
    // eslint-disable-next-line
    [searchRoute, i18n.language, setSearchRoute]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [handleKeydown]);

  return useMemo(
    () => (
      <AppToolbar className={classes.toolbar}>
        <Link
          to={`/${i18n.language}/board`}
          onClick={(e) => {
            e.preventDefault();
            vibrate(vibrateDuration);
            history.push(`/${i18n.language}/board`);
          }}
          rel="nofollow"
        >
          <Typography
            component="h1"
            variant="subtitle2"
            className={classes.appTitle}
          >
            {t("巴士到站預報")}
          </Typography>
        </Link>
        <Input
          id="searchInput"
          className={classes.searchRouteInput}
          type="text"
          value={searchRoute}
          placeholder={t("巴士線")}
          onChange={(e) => {
            if (
              e.target.value.toUpperCase() in routeList ||
              e.target.value in routeList
            ) {
              (document.activeElement as HTMLElement).blur();
              history.push(`/${i18n.language}/route/${e.target.value}`);
            }
            setSearchRoute(e.target.value);
          }}
          onFocus={(e) => {
            vibrate(vibrateDuration);
            if (navigator.userAgent !== "prerendering" && checkMobile()) {
              (document.activeElement as HTMLElement).blur();
            }
            history.replace(`/${i18n.language}/board`);
          }}
          disabled={path.includes("route")}
        />
        <Box className={classes.funcPanel}>
          {weatherCodes.slice(0, 2).map((code) => (
            <Avatar
              key={code}
              variant="square"
              src={WeatherIcons[code]}
              sx={{ height: 24, width: 24, m: 1 }}
            />
          ))}
          {geoPermission === "granted" && (
            <IconButton
              aria-label="relocate"
              onClick={() => relocateGeolocation()}
            >
              <LocationOnIcon />
            </IconButton>
          )}
          <Button
            sx={languageSx}
            onClick={() =>
              handleLanguageChange(i18n.language === "zh" ? "en" : "zh")
            }
            id="lang-selector"
            variant="text"
            disableElevation
            disableRipple
          >
            {i18n.language !== "zh" ? "繁" : "En"}
          </Button>
        </Box>
      </AppToolbar>
    ),
    // eslint-disable-next-line
    [
      searchRoute,
      i18n.language,
      location.pathname,
      colorMode,
      geoPermission,
      vibrateDuration,
      weatherCodes,
    ]
  );
};

export default Header;

const PREFIX = "header";

const classes = {
  toolbar: `${PREFIX}-toolbar`,
  appTitle: `${PREFIX}-appTitle`,
  searchRouteInput: `${PREFIX}-searchRouteInput`,
  funcPanel: `${PREFIX}-funcPanel`,
};

const AppToolbar = styled(Toolbar)(({ theme }) => ({
  [`& .${classes.appTitle}`]: {
    color:
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary,
  },
  [`&.${classes.toolbar}`]: {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : theme.palette.primary.main,
    "& a": {
      color: "black",
      textDecoration: "none",
    },
    display: "flex",
    justifyContent: "space-between",
  },
  [`& .${classes.searchRouteInput}`]: {
    maxWidth: "100px",
    "& input": {
      textAlign: "center",
    },
    "& input::before": {
      borderBottom: `1px ${theme.palette.text.primary} solid`,
    },
  },
  [`& .${classes.funcPanel}`]: {
    display: "flex",
    alignItems: "center",
  },
}));

const languageSx: SxProps<Theme> = {
  color: (theme) => theme.palette.text.primary,
  minWidth: "40px",
  p: 1,
  borderRadius: 5,
  fontWeight: 900,
  textTransform: "none",
};
