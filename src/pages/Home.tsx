import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { List, Paper, Tabs, Tab, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import { useTranslation } from "react-i18next";
import CloudIcon from "@mui/icons-material/Cloud";
import StarIcon from "@mui/icons-material/Star";
import CompassCalibrationIcon from "@mui/icons-material/CompassCalibration";

import AppContext from "../AppContext";
import { getDistance, setSeoHeader } from "../utils";
import SuccinctTimeReport from "../components/home/SuccinctTimeReport";
import debounce from "lodash.debounce";
import { Location, RouteList, StopListEntry, StopList } from "hk-bus-eta";
import { isHoliday, isRouteAvaliable } from "../timetable";
import BadWeatherCard from "../components/layout/BadWeatherCard";

const Home = () => {
  const {
    AppTitle,
    geolocation,
    hotRoute,
    savedEtas,
    db: { holidays, routeList, stopList },
    isRouteFilter,
    homeTab,
    setHomeTab,
  } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const isTodayHoliday = isHoliday(holidays, new Date());

  // selectedRoutes is a '|' joined string instead of array for useMemo comparison
  const [selectedRoutes, setSelectedRoute] = useState(
    getSelectedRoutes({
      geolocation,
      hotRoute,
      savedEtas,
      routeList,
      stopList,
      isRouteFilter,
      isTodayHoliday,
      homeTab,
    })
  );

  const updateRoutes = useRef((newGeolocation) => {
    const _selectedRoutes = getSelectedRoutes({
      geolocation: newGeolocation,
      hotRoute,
      savedEtas,
      routeList,
      stopList,
      isRouteFilter,
      isTodayHoliday,
      homeTab,
    });
    console.log('updated')
    if (_selectedRoutes !== selectedRoutes) {
      setSelectedRoute(_selectedRoutes);
    }
  }).current;

  const debouncedUpdateRoutes = useRef(debounce(updateRoutes, 1000)).current;

  useEffect(() => {
    setSeoHeader({
      title: `${t("Dashboard")} - ${t(AppTitle)}`,
      description: t("home-page-description"),
      lang: i18n.language,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  useEffect(() => {
    debouncedUpdateRoutes(geolocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation]);

  useEffect(() => {
    const _selectedRoutes = getSelectedRoutes({
      geolocation,
      hotRoute,
      savedEtas,
      routeList,
      stopList,
      isRouteFilter,
      isTodayHoliday,
      homeTab,
    });
    if (_selectedRoutes !== selectedRoutes) {
      setSelectedRoute(_selectedRoutes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeTab]);

  return useMemo(
    () => (
      <Root className={classes.root} square elevation={0}>
        <Typography component="h1" style={visuallyHidden}>{`${t(
          "Dashboard"
        )} - ${t(AppTitle)}`}</Typography>
        <Typography component="h2" style={visuallyHidden}>
          {t("home-page-description")}
        </Typography>
        <Tabs
          value={homeTab}
          onChange={(e, v) => setHomeTab(v)}
          className={classes.tabbar}
        >
          <Tab
            iconPosition="start"
            icon={<CloudIcon />}
            label={t("綜合")}
            value="both"
            disableRipple
          />
          <Tab
            iconPosition="start"
            icon={<StarIcon />}
            label={t("常用")}
            value="saved"
            disableRipple
          />
          <Tab
            iconPosition="start"
            icon={<CompassCalibrationIcon />}
            label={t("附近")}
            value="nearby"
            disableRipple
          />
        </Tabs>
        <BadWeatherCard />
        <List disablePadding>
          {selectedRoutes.split("|").map((selectedRoute, idx) => (
            <SuccinctTimeReport
              key={`route-shortcut-${idx}`}
              routeId={selectedRoute}
            />
          ))}
        </List>
      </Root>
    ),
    // eslint-disable-next-line
    [selectedRoutes, homeTab, t]
  );
};

export default Home;

const getSelectedRoutes = ({
  hotRoute,
  savedEtas,
  geolocation,
  stopList,
  routeList,
  isRouteFilter,
  isTodayHoliday,
  homeTab,
}: {
  hotRoute: Record<string, number>;
  savedEtas: string[];
  geolocation: Location;
  stopList: StopList;
  routeList: RouteList;
  isRouteFilter: boolean;
  isTodayHoliday: boolean;
  homeTab: "both" | "saved" | "nearby";
}): string => {
  const selectedRoutes = savedEtas
    .concat(
      Object.entries(hotRoute)
        .filter(([route, count]) => count > 5)
        .sort((a, b) => b[1] - a[1])
        .map(([routeId]) => routeId)
    )
    .filter((routeUrl, index, self) => {
      return (
        self.indexOf(routeUrl) === index && routeUrl.split("/")[0] in routeList
      );
    })
    .map((routeUrl): [string, number] => {
      const [routeId, stopIdx] = routeUrl.split("/");
      // TODO: taking the longest stop array to avoid error, should be fixed in the database
      const stop =
        stopList[
          Object.values(routeList[routeId].stops).sort(
            (a, b) => b.length - a.length
          )[0][stopIdx]
        ];
      return [routeUrl, getDistance(geolocation, stop.location)];
    })
    .sort((a, b) => a[1] - b[1])
    .map((v) => v[0])
    .slice(0, 20);

  const nearbyRoutes = Object.entries(stopList)
    .map((stop: [string, StopListEntry]): [string, StopListEntry, number] =>
      // potentially could be optimized by other distance function
      [...stop, getDistance(stop[1].location, geolocation)]
    )
    .filter(
      (stop) =>
        // keep only nearby 1000m stops
        stop[2] < 1000
    )
    .sort((a, b) => a[2] - b[2])
    .slice(0, 5)
    .reduce((acc, [stopId]) => {
      // keep only the nearest 5 stops
      let routeIds = [];
      Object.entries(routeList).forEach(([key, route]) => {
        ["kmb", "nwfb", "ctb", "nlb"].forEach((co) => {
          if (route.stops[co] && route.stops[co].includes(stopId)) {
            routeIds.push(key + "/" + route.stops[co].indexOf(stopId));
          }
        });
      });
      return acc.concat(routeIds);
    }, []);

  return []
    .concat(homeTab !== "nearby" ? selectedRoutes : [])
    .concat(homeTab !== "saved" ? nearbyRoutes : [])
    .filter((v, i, s) => s.indexOf(v) === i) // uniqify
    .filter((routeUrl) => {
      const [routeId] = routeUrl.split("/");
      return (
        !isRouteFilter ||
        isRouteAvaliable(routeId, routeList[routeId].freq, isTodayHoliday)
      );
    })
    .concat(Array(20).fill("")) // padding
    .slice(0, 20)
    .join("|");
};

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
  [`& .${classes.tabbar}`]: {
    background: theme.palette.background.default,
    minHeight: "36px",
    [`& .MuiTab-root`]: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 0,
      paddingBottom: 0,
      minHeight: "32px",
      [`&.Mui-selected`]: {
        color:
          theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
      },
    },
    [`& .MuiTabs-flexContainer`]: {
      justifyContent: "center",
    },
    [`& .MuiTabs-indicator`]: {
      backgroundColor:
        theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
    },
  },
}));
