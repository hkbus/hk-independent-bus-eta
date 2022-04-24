import React, { useContext, useEffect, useRef, useState } from "react";
import { Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import { useTranslation } from "react-i18next";

import AppContext from "../AppContext";
import { setSeoHeader } from "../utils";
import debounce from "lodash.debounce";
import { Location } from "hk-bus-eta";
import HomeTabbar, { isHomeTab } from "../components/home/HomeTabbar";
import type { HomeTabType } from "../components/home/HomeTabbar";
import BadWeatherCard from "../components/layout/BadWeatherCard";
import SwipeableList from "../components/home/SwipeableList";

const Home = () => {
  const { AppTitle, geolocation } = useContext(AppContext);
  const { t, i18n } = useTranslation();

  const swipeableList = useRef(null);
  const _homeTab = localStorage.getItem("homeTab");
  const [homeTab, setHomeTab] = useState<HomeTabType>(
    isHomeTab(_homeTab) ? _homeTab : "both"
  );

  useEffect(() => {
    setSeoHeader({
      title: `${t("Dashboard")} - ${t(AppTitle)}`,
      description: t("home-page-description"),
      lang: i18n.language,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // debounce to avoid rapidly UI changes due to geolocation changes
  const [_geolocation, set_geolocation] = useState<Location>(geolocation);
  const debouncedUpdateGeolocation = useRef(
    debounce(() => {
      console.log("update location", geolocation);
      set_geolocation(geolocation);
    }, 1000)
  ).current;

  useEffect(() => {
    debouncedUpdateGeolocation(geolocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation]);

  const handleTabChange = (v, rerenderList = false) => {
    setHomeTab(v);
    localStorage.setItem("homeTab", v);
    if (swipeableList.current && rerenderList) {
      swipeableList.current.changeTab(v);
    }
  };

  return (
    <Root className={classes.root} square elevation={0}>
      <Typography component="h1" style={visuallyHidden}>{`${t(
        "Dashboard"
      )} - ${t(AppTitle)}`}</Typography>
      <Typography component="h2" style={visuallyHidden}>
        {t("home-page-description")}
      </Typography>
      <HomeTabbar homeTab={homeTab} onChangeTab={handleTabChange} />
      <BadWeatherCard />
      <SwipeableList
        ref={swipeableList}
        homeTab={homeTab}
        geolocation={_geolocation}
        onChangeTab={handleTabChange}
      />
    </Root>
  );
};

export default Home;

const PREFIX = "home";

const classes = {
  root: `${PREFIX}-root`,
  tabbar: `${PREFIX}-tabbar`,
};

const Root = styled(Paper)(({ theme }) => ({
  [`&.${classes.root}`]: {
    background:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
    height: "calc(100vh - 125px)",
    overflowY: "scroll",
    textAlign: "center",
  },
}));
