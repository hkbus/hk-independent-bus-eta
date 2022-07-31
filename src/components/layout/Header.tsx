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
import Link from "../Link";
import { useRouter } from "next/router";
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
    db,
    vibrateDuration,
    geoPermission,
    updateGeolocation,
    changeLanguage,
  } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { pathname } = router;
  const weatherCodes = useWeatherCode();

  const handleLanguageChange = useCallback(() => {
    const lang = i18n.language === "zh" ? "en" : "zh";
    vibrate(vibrateDuration);
    router.replace(router.pathname.replace("/" + i18n.language, "/" + lang));
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  }, [i18n, router, vibrateDuration]);

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
        router.replace(`/${i18n.language}/board`);
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

  const onClickBoard = useCallback(
    (e: React.SyntheticEvent<HTMLElement>) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      router.push(`/${i18n.language}/board`);
    },
    [i18n.language, router, vibrateDuration]
  );

  const onInputChange: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = useCallback(
    (e) => {
      if (db.routeList !== undefined) {
        if (
          e.target.value.toUpperCase() in db.routeList ||
          e.target.value in db.routeList
        ) {
          (document.activeElement as HTMLElement).blur();
          router.push(`/${i18n.language}/route/${e.target.value}`);
        }
      }
      setSearchRoute(e.target.value);
    },
    [db.routeList, i18n.language, router, setSearchRoute]
  );

  const onInputFocus = useCallback(() => {
    vibrate(vibrateDuration);
    if (typeof window !== "undefined" && checkMobile()) {
      (document.activeElement as HTMLElement).blur();
    }
    router.replace(`/${i18n.language}/board`);
  }, [i18n.language, router, vibrateDuration]);

  const weatherAvatar = useMemo(() => {
    return weatherCodes
      .slice(0, 2)
      .map((code) => (
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
          sx={{ height: 24, width: 24, m: 1 }}
        />
      ));
  }, [i18n.language, weatherCodes]);

  return (
    <AppToolbar className={classes.toolbar}>
      <Link href={`/${i18n.language}/board`} rel="nofollow">
        <Typography
          onClick={onClickBoard}
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
        onChange={onInputChange}
        onFocus={onInputFocus}
      />
      <Box className={classes.funcPanel}>
        {weatherAvatar}
        {geoPermission === "granted" && (
          <IconButton aria-label="relocate" onClick={relocateGeolocation}>
            <LocationOnIcon />
          </IconButton>
        )}
        <Button
          sx={languageSx}
          onClick={handleLanguageChange}
          id="lang-selector"
          variant="text"
          disableElevation
          disableRipple
        >
          {i18n.language !== "zh" ? "繁" : "En"}
        </Button>
      </Box>
    </AppToolbar>
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
      textDecoration: "none",
    },
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
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
