import React, { useContext, useMemo } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  SxProps,
  Theme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NearMeIcon from "@mui/icons-material/NearMe";
import TimerIcon from "@mui/icons-material/Timer";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { vibrate } from "../../utils";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { selectedRoute, colorMode, vibrateDuration } = useContext(AppContext);

  const navigate = useNavigate();
  const handleClick = (
    link: string,
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    vibrate(vibrateDuration);
    setTimeout(() => navigate(link), 0);
  };

  return useMemo(
    () => (
      <BottomNavigation
        value={location.pathname.replace(/(.*)\/[0-9]*?$/, "$1")}
        showLabels={true}
        sx={rootSx}
      >
        <BottomNavigationAction
          label={t("首頁")}
          component={Link}
          to={`/${i18n.language}`}
          onClick={(e) => handleClick(`/${i18n.language}`, e)}
          value={`/${i18n.language}`}
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label={t("搜尋")}
          component={Link}
          to={`/${i18n.language}/board`}
          onClick={(e) => handleClick(`/${i18n.language}/board`, e)}
          value={`/${i18n.language}/board`}
          icon={<SearchIcon />}
        />
        <BottomNavigationAction
          label={selectedRoute.split("-")[0]}
          component={Link}
          to={`/${i18n.language}/route/${selectedRoute
            .replace(/(.*)\/.*$/, "$1")
            .toLowerCase()}`}
          onClick={(e) =>
            handleClick(
              `/${i18n.language}/route/${selectedRoute.toLowerCase()}`,
              e
            )
          }
          value={`/${i18n.language}/route/${selectedRoute
            .replace(/(.*)\/.*$/, "$1")
            .toLowerCase()}`}
          icon={<TimerIcon />}
          style={{ textTransform: "uppercase" }}
        />
        <BottomNavigationAction
          label={t("規劃")}
          component={Link}
          to={`/${i18n.language}/search`}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
            handleClick(`/${i18n.language}/search`, e)
          }
          value={`/${i18n.language}/search`}
          icon={<NearMeIcon />}
        />
        <BottomNavigationAction
          label={t("設定")}
          component={Link}
          to={`/${i18n.language}/settings`}
          rel="nofollow"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
            handleClick(`/${i18n.language}/settings`, e)
          }
          value={`/${i18n.language}/settings`}
          icon={<SettingsIcon />}
        />
      </BottomNavigation>
    ),
    // eslint-disable-next-line
    [
      location.pathname,
      i18n.language,
      colorMode,
      selectedRoute,
      vibrateDuration,
    ]
  );
};

export default Footer;

const rootSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.primary.main,
  bottom: "0",
  height: "initial",
  "& .MuiBottomNavigationAction-root": {
    width: "20%",
    padding: "6px 0",
    minWidth: 0,
  },
  "& .MuiBottomNavigationAction-label": {
    fontSize: "0.875rem",
  },
  "& .Mui-selected": {
    color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary,
  },
};
