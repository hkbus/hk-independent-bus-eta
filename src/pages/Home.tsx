import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Paper, SxProps, Theme, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";

import AppContext from "../AppContext";
import debounce from "lodash.debounce";
import type { Location } from "hk-bus-eta";
import HomeTabbar, { isHomeTab } from "../components/home/HomeTabbar";
import type { HomeTabType } from "../components/home/HomeTabbar";
import SeoHeader from "../SeoHeader";
const BadWeatherCard = dynamic(
  () => import("../components/layout/BadWeatherCard"),
  { ssr: false }
);
const SwipeableList = dynamic(
  () => import("../components/home/SwipeableList"),
  { ssr: false }
);

const Home = () => {
  const { AppTitle, geolocation } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const swipeableList = useRef(null);
  const [homeTab, setHomeTab] = useState<HomeTabType>("both");
  useEffect(() => {
    const _homeTab = localStorage.getItem("homeTab");
    if (isHomeTab(_homeTab) && _homeTab != "both") {
      setHomeTab(_homeTab);
    }
  }, []);

  // debounce to avoid rapidly UI changes due to geolocation changes
  const [_geolocation, set_geolocation] = useState<Location>(geolocation);
  const debouncedUpdateGeolocation = useRef(
    debounce(() => {
      set_geolocation(geolocation);
    }, 1000)
  ).current;

  useEffect(() => {
    debouncedUpdateGeolocation(geolocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation]);

  const handleTabChange = useCallback(
    (v: HomeTabType, rerenderList = false) => {
      setHomeTab(v);
      localStorage.setItem("homeTab", v);
      if (swipeableList.current && rerenderList) {
        swipeableList.current.changeTab?.(v);
      }
    },
    []
  );
  return (
    <>
      <SeoHeader
        title={`${t("Dashboard")} - ${t(AppTitle)}`}
        description={t("home-page-description")}
      />
      <Paper sx={paperSx} square elevation={0}>
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
      </Paper>
    </>
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
};
