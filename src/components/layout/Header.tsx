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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SettingsIcon from "@mui/icons-material/Settings";
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
    changeLanguage,
  } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  let location = useLocation();
  const navigate = useNavigate();
  const weatherCodes = useWeatherCode();

  const handleLanguageChange = (lang: "zh" | "en") => {
    vibrate(vibrateDuration);
    navigate(location.pathname.replace("/" + i18n.language, "/" + lang), {
      replace: true,
    });
    changeLanguage(lang);
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
        navigate(`/${i18n.language}/board`, { replace: true });
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
      <Toolbar sx={rootSx}>
        <Link
          to={`/${i18n.language}`}
          onClick={(e) => {
            e.preventDefault();
            vibrate(vibrateDuration);
            navigate(`/${i18n.language}`);
          }}
          rel="nofollow"
        >
          <Typography component="h1" variant="subtitle2" sx={appTitleSx}>
            {t("巴士到站預報")}
          </Typography>
        </Link>
        <Input
          id="searchInput"
          sx={searchRouteInputSx}
          type="text"
          value={searchRoute}
          placeholder={t("巴士線")}
          onChange={(e) => {
            if (
              e.target.value.toUpperCase() in routeList ||
              e.target.value in routeList
            ) {
              (document.activeElement as HTMLElement).blur();
              navigate(`/${i18n.language}/route/${e.target.value}`);
            }
            setSearchRoute(e.target.value);
          }}
          onFocus={() => {
            vibrate(vibrateDuration);
            if (navigator.userAgent !== "prerendering" && checkMobile()) {
              (document.activeElement as HTMLElement).blur();
            }
            navigate(`/${i18n.language}/board`, { replace: true });
          }}
        />
        <Box sx={funcPanelSx}>
          {weatherCodes.slice(0, 2).map((code) => (
            <Avatar
              onClick={() =>
                window.open(
                  `https://www.hko.gov.hk/${
                    i18n.language === "zh" ? "tc" : "en"
                  }/detail.htm`
                )
              }
              key={code}
              variant="square"
              src={WeatherIcons[code]}
              sx={weatherImg}
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
          <IconButton
            component={Link}
            to={`/${i18n.language}/settings`}
            rel="nofollow"
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
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

const rootSx: SxProps<Theme> = {
  backgroundColor: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.primary.main,
  "& a": {
    textDecoration: "none",
  },
  display: "flex",
  justifyContent: "space-between",
  px: 1,
};

const appTitleSx: SxProps<Theme> = {
  color: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.primary.main
      : theme.palette.text.primary,
};

const searchRouteInputSx: SxProps<Theme> = {
  maxWidth: "100px",
  "& input": {
    textAlign: "center",
  },
  "& input::before": {
    borderBottom: (theme) => `1px ${theme.palette.text.primary} solid`,
  },
};

const funcPanelSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
};

const languageSx: SxProps<Theme> = {
  color: (theme) => theme.palette.text.primary,
  minWidth: "40px",
  p: 1,
  borderRadius: 5,
  fontWeight: 900,
  textTransform: "none",
};

const weatherImg: SxProps<Theme> = {
  background: "white",
  height: 24,
  width: 24,
  m: 1,
};
