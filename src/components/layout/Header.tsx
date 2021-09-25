import React, { useContext, useMemo } from "react";
import { Input, Tabs, Tab, Toolbar, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link, useLocation, useHistory, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { vibrate, checkMobile } from "../../utils";

const Header = () => {
  const {
    searchRoute,
    setSearchRoute,
    db: { routeList },
    colorMode,
  } = useContext(AppContext);
  const { path } = useRouteMatch();
  const { t, i18n } = useTranslation();
  let location = useLocation();
  const history = useHistory();

  const handleLanguageChange = (lang) => {
    vibrate(1);
    history.replace(location.pathname.replace("/" + i18n.language, "/" + lang));
    i18n.changeLanguage(lang);
  };

  return useMemo(
    () => (
      <AppToolbar className={classes.toolbar}>
        <Link
          to={`/${i18n.language}/board`}
          onClick={(e) => {
            e.preventDefault();
            vibrate(1);
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
            vibrate(1);
            if (navigator.userAgent !== "prerendering" && checkMobile()) {
              (document.activeElement as HTMLElement).blur();
            }
            history.replace(`/${i18n.language}/board`);
          }}
          disabled={path.includes("route")}
        />
        <LanguageTabs
          className={classes.languageTabs}
          value={i18n.language}
          onChange={(e, v) => handleLanguageChange(v)}
        >
          <Tab
            disableRipple
            className={classes.languageTab}
            id="en-selector"
            value="en"
            label="En"
            component={Link}
            to={`${window.location.pathname.replace("/zh", "/en")}`}
            onClick={(e) => e.preventDefault()}
          />
          <Tab
            disableRipple
            className={classes.languageTab}
            id="zh-selector"
            value="zh"
            label="繁"
            component={Link}
            to={`${window.location.pathname.replace("/en", "/zh")}`}
            onClick={(e) => e.preventDefault()}
          />
        </LanguageTabs>
      </AppToolbar>
      // eslint-disable-next-line
    ),
    [searchRoute, i18n.language, location.pathname, colorMode]
  );
};

export default Header;

const PREFIX = "header";

const classes = {
  toolbar: `${PREFIX}-toolbar`,
  appTitle: `${PREFIX}-appTitle`,
  searchRouteInput: `${PREFIX}-searchRouteInput`,
  languageTabs: `${PREFIX}-languagetabs`,
  languageTab: `${PREFIX}-languagetab`,
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
    zIndex: theme.zIndex.drawer * 2,
  },
  [`& .${classes.searchRouteInput}`]: {
    maxWidth: "50px",
    "& input": {
      textAlign: "center",
    },
    "& input::before": {
      borderBottom: `1px ${theme.palette.text.primary} solid`,
    },
  },
}));

const LanguageTabs = styled(Tabs)(({ theme }) => ({
  [`&.${classes.languageTabs}`]: {
    borderBottom: "none",
    minHeight: 24,
    "& .MuiTabs-indicator": {
      backgroundColor: "transparent",
    },
  },
  [`& .${classes.languageTab}`]: {
    textTransform: "none",
    minWidth: 36,
    minHeight: 24,
    fontWeight: 900,
    marginRight: theme.spacing(0),
    fontSize: "15px",
    opacity: 1,
    padding: "6px 6px",
    "&.MuiTab-root": {
      color: theme.palette.text.primary,
      borderRadius: "30px",
      padding: "0px 10px 0px 10px",
    },
    "&.Mui-selected": {
      "&.MuiTab-root": {
        color: "black",
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.primary.main
            : theme.palette.background.paper,
      },
    },
  },
}));
