import React, { useContext, useMemo } from "react";
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  SxProps,
  Theme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NearMeIcon from "@mui/icons-material/NearMe";
import FlagCircleIcon from "@mui/icons-material/FlagCircle";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { vibrate } from "../../utils";
import EmotionContext from "../../EmotionContext";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { selectedRoute, colorMode, vibrateDuration } = useContext(AppContext);
  const { isRemind } = useContext(EmotionContext);

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
          label={t("車站")}
          component={Link}
          to={`/${i18n.language}/stops`}
          onClick={(e) => handleClick(`/${i18n.language}/stops`, e)}
          value={`/${i18n.language}/stops`}
          icon={<FlagCircleIcon />}
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
          label={t("通告")}
          component={Link}
          to={`/${i18n.language}/notice`}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
            handleClick(`/${i18n.language}/notice`, e)
          }
          value={`/${i18n.language}/notice`}
          icon={<NewspaperIcon />}
        />
        <BottomNavigationAction
          label={t("心情車站")}
          component={Link}
          to={`/${i18n.language}/emotion`}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
            handleClick(`/${i18n.language}/emotion`, e)
          }
          value={`/${i18n.language}/emotion`}
          icon={
            <Badge
              badgeContent={1}
              invisible={!isRemind || location.pathname.endsWith("/emotion")}
              color="error"
            >
              <FavoriteIcon />
            </Badge>
          }
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
  background: (theme) => theme.palette.background.default,
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
      `${
        theme.palette.mode === "dark"
          ? theme.palette.primary.main
          : theme.palette.text.primary
      } !important`,
  },
};
