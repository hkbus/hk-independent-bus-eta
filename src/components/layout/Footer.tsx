import React, { useCallback, useContext, useMemo } from "react";
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
import AppContext from "../../context/AppContext";
import { vibrate } from "../../utils";
import EmotionContext from "../../context/EmotionContext";
import useLanguage from "../../hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();
  const language = useLanguage();
  const location = useLocation();
  const { vibrateDuration } = useContext(AppContext);
  const { isRemind } = useContext(EmotionContext);

  const navigate = useNavigate();
  const handleClick = useCallback(
    (link: string, e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      setTimeout(() => navigate(link), 0);
    },
    [vibrateDuration, navigate]
  );

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
          to={`/${language}`}
          onClick={(e) => handleClick(`/${language}`, e)}
          value={`/${language}`}
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label={t("車站")}
          component={Link}
          to={`/${language}/stops`}
          onClick={(e) => handleClick(`/${language}/stops`, e)}
          value={`/${language}/stops`}
          icon={<FlagCircleIcon />}
        />
        <BottomNavigationAction
          label={t("搜尋")}
          component={Link}
          to={`/${language}/board`}
          onClick={(e) => handleClick(`/${language}/board`, e)}
          value={`/${language}/board`}
          icon={<SearchIcon />}
        />
        <BottomNavigationAction
          label={t("規劃")}
          component={Link}
          to={`/${language}/search`}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
            handleClick(`/${language}/search`, e)
          }
          value={`/${language}/search`}
          icon={<NearMeIcon />}
        />
        <BottomNavigationAction
          label={t("通告")}
          component={Link}
          to={`/${language}/notice`}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
            handleClick(`/${language}/notice`, e)
          }
          value={`/${language}/notice`}
          icon={<NewspaperIcon />}
        />
        <BottomNavigationAction
          label={t("Heart")}
          component={Link}
          to={`/${language}/emotion`}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
            handleClick(`/${language}/emotion`, e)
          }
          value={`/${language}/emotion`}
          icon={
            <Badge
              invisible={!isRemind || location.pathname.endsWith("/emotion")}
              color="error"
              variant="dot"
            >
              <FavoriteIcon />
            </Badge>
          }
        />
      </BottomNavigation>
    ),
    [location.pathname, language, t, isRemind, handleClick]
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
