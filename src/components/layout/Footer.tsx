import React, { useContext, useMemo } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NearMeIcon from "@mui/icons-material/NearMe";
import TimerIcon from "@mui/icons-material/Timer";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { styled } from "@mui/material/styles";
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
      <Root
        value={location.pathname.replace(/(.*)\/[0-9]*?$/, "$1")}
        showLabels={true}
        classes={{ root: classes.root }}
      >
        <BottomNavigationAction
          label={t("首頁")}
          component={Link}
          to={`/${i18n.language}`}
          onClick={(e) => handleClick(`/${i18n.language}`, e)}
          value={`/${i18n.language}`}
          icon={<HomeIcon />}
          classes={{
            root: "footer-actionItem",
            selected: "footer-selected",
          }}
        />
        <BottomNavigationAction
          label={t("搜尋")}
          component={Link}
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
          classes={{
            root: "footer-actionItem",
            selected: "footer-selected",
          }}
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
          classes={{
            root: "footer-actionItem",
            selected: "footer-selected",
          }}
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
          classes={{
            root: "footer-actionItem",
            selected: classes.selected,
          }}
        />
      </Root>
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
    position: "sticky",
    bottom: "0",
    height: "initial",
    [`& .MuiBottomNavigationAction-root`]: {
      width: "20%",
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
