import React, { useCallback, useContext, useMemo } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NearMeIcon from "@mui/icons-material/NearMe";
import TimerIcon from "@mui/icons-material/Timer";
import SettingsIcon from "@mui/icons-material/Settings";
import { NextLinkComposed } from "../Link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { styled } from "@mui/material/styles";
import { vibrate } from "../../utils";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const { selectedRoute, vibrateDuration } = useContext(AppContext);

  const router = useRouter();
  const handleClick = useCallback(
    (link: string, e: React.MouseEvent<unknown>) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      setTimeout(() => router.push(link), 0);
    },
    [router, vibrateDuration]
  );

  return useMemo(
    () => (
      <Root
        value={router.pathname.replace(/(.*)\/[0-9]*?$/, "$1")}
        showLabels={true}
        classes={{ root: classes.root }}
      >
        <BottomNavigationAction
          label={t("首頁")}
          component={NextLinkComposed}
          to={`/${i18n.language}/`}
          onClick={(e) => handleClick(`/${i18n.language}/`, e)}
          value={`/${i18n.language}/`}
          icon={<HomeIcon />}
          classes={{
            root: "footer-actionItem",
            selected: "footer-selected",
          }}
        />
        <BottomNavigationAction
          label={t("搜尋")}
          component={NextLinkComposed}
          to={`/${i18n.language}/board`}
          onClick={(e) => handleClick(`/${i18n.language}/board`, e)}
          value={`/${i18n.language}/board`}
          icon={<SearchIcon />}
          classes={{
            root: "footer-actionItem",
            selected: "footer-selected",
          }}
        />
        <BottomNavigationAction
          label={selectedRoute.split("-")[0]}
          component={NextLinkComposed}
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
          classes={{
            root: "footer-actionItem",
            selected: "footer-selected",
          }}
        />
        <BottomNavigationAction
          label={t("規劃")}
          component={NextLinkComposed}
          to={`/${i18n.language}/search`}
          onClick={(e: React.MouseEvent<unknown>) =>
            handleClick(`/${i18n.language}/search`, e)
          }
          value={`/${i18n.language}/search`}
          icon={<NearMeIcon />}
          classes={{
            root: "footer-actionItem",
            selected: "footer-selected",
          }}
        />
        <BottomNavigationAction
          label={t("設定")}
          component={NextLinkComposed}
          to={`/${i18n.language}/settings`}
          rel="nofollow"
          onClick={(e: React.MouseEvent<unknown>) =>
            handleClick(`/${i18n.language}/settings`, e)
          }
          value={`/${i18n.language}/settings`}
          icon={<SettingsIcon />}
          classes={{
            root: "footer-actionItem",
            selected: classes.selected,
          }}
        />
      </Root>
    ),
    [router.pathname, t, i18n.language, selectedRoute, handleClick]
  );
};

export default Footer;

const PREFIX = "footer";

const classes = {
  root: `${PREFIX}-root`,
  selected: `${PREFIX}-selected`,
};

const Root = styled(BottomNavigation)(({ theme }) => ({
  [`&.${classes.root}`]: {
    background:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : theme.palette.primary.main,
    bottom: "0",
    height: "initial",
    [`& .MuiBottomNavigationAction-root`]: {
      width: "20%",
      padding: "6px 0",
      minWidth: 0,
    },
    [`& .MuiBottomNavigationAction-label`]: {
      fontSize: "0.875rem",
    },
    [`& .Mui-selected.${classes.selected}`]: {
      color:
        theme.palette.mode === "dark"
          ? theme.palette.primary.main
          : theme.palette.text.primary,
    },
  },
}));
