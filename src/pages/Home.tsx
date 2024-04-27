import { useContext, useEffect, useRef, useState } from "react";
import { Paper, SxProps, Theme, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useTranslation } from "react-i18next";

import { setSeoHeader } from "../utils";
import HomeTabbar, { isHomeTab } from "../components/home/HomeTabbar";
import type { HomeTabType } from "../components/home/HomeTabbar";
import BadWeatherCard from "../components/layout/BadWeatherCard";
import SwipeableList, {
  SwipeableListRef,
} from "../components/home/SwipeableList";
import DbRenewReminder from "../components/layout/DbRenewReminder";
import { useParams } from "react-router-dom";
import useLanguage from "../hooks/useTranslation";
import CollectionContext from "../CollectionContext";
import DbContext from "../context/DbContext";

const Home = () => {
  const { AppTitle } = useContext(DbContext);
  const { collections } = useContext(CollectionContext);
  const { t } = useTranslation();
  const language = useLanguage();
  const { collectionName } = useParams();

  const swipeableList = useRef<SwipeableListRef>(null);
  const _homeTab = collectionName ?? localStorage.getItem("homeTab");
  const [homeTab, setHomeTab] = useState<HomeTabType | string>(
    isHomeTab(_homeTab, collections) ? _homeTab : "nearby"
  );

  useEffect(() => {
    setSeoHeader({
      title: `${t("Dashboard")} - ${t(AppTitle)}`,
      description: t("home-page-description"),
      lang: language,
    });
  }, [language, AppTitle, t]);

  const handleTabChange = (
    v: HomeTabType | string,
    rerenderList: boolean = false
  ) => {
    setHomeTab(v);
    localStorage.setItem("homeTab", v);
    if (swipeableList.current && rerenderList) {
      swipeableList.current.changeTab(v);
    }
  };

  return (
    <Paper sx={paperSx} square elevation={0}>
      <Typography component="h1" style={visuallyHidden}>{`${t(
        "Dashboard"
      )} - ${t(AppTitle)}`}</Typography>
      <Typography component="h2" style={visuallyHidden}>
        {t("home-page-description")}
      </Typography>
      <HomeTabbar homeTab={homeTab} onChangeTab={handleTabChange} />
      <BadWeatherCard />
      <DbRenewReminder />
      <SwipeableList
        ref={swipeableList}
        homeTab={homeTab}
        onChangeTab={handleTabChange}
      />
    </Paper>
  );
};

export default Home;

const paperSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  width: "100%",
  height: "100%",
};
