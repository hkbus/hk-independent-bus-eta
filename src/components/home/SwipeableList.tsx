import React, {
  useContext,
  useMemo,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import SwipeableViews from "react-swipeable-views";
import { Box, List, Typography } from "@mui/material";
import { Location, RouteList, StopListEntry, StopList } from "hk-bus-eta";

import AppContext from "../../AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";
import { getDistance } from "../../utils";
import SuccinctTimeReport from "./SuccinctTimeReport";
import type { HomeTabType } from "./HomeTabbar";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "../Progress";
import { RouteCollection } from "../../typing";

interface SwipeableListProps {
  geolocation: Location;
  homeTab: HomeTabType;
  onChangeTab: (v: string) => void;
}

interface SwipeableListRef {
  changeTab: (v: HomeTabType) => void;
}

interface SelectedRoutes {
  both: string;
  saved: string;
  nearby: string;
  collections: Array<{ name: string; routes: string }>;
}

const SwipeableList = React.forwardRef<SwipeableListRef, SwipeableListProps>(
  ({ geolocation, homeTab, onChangeTab }, ref) => {
    const {
      hotRoute,
      savedEtas,
      db: { holidays, routeList, stopList },
      isRouteFilter,
      collections,
    } = useContext(AppContext);
    const isTodayHoliday = useMemo(
      () => isHoliday(holidays, new Date()),
      [holidays]
    );
    const defaultHometab = useRef(homeTab);
    const { t } = useTranslation();
    const [selectedRoutes, setSelectedRoutes] = useState<SelectedRoutes | null>(
      null
    );

    useImperativeHandle(ref, () => ({
      changeTab: (v) => {
        defaultHometab.current = v;
      },
    }));

    useEffect(() => {
      setSelectedRoutes(
        getSelectedRoutes({
          geolocation,
          hotRoute,
          savedEtas,
          collections,
          routeList,
          stopList,
          isRouteFilter,
          isTodayHoliday,
        })
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geolocation]);

    const BothRouteList = useMemo(
      () =>
        selectedRoutes ? (
          <List disablePadding>
            {selectedRoutes["both"]
              .split("|")
              .map(
                (selectedRoute, idx) =>
                  Boolean(selectedRoute) && (
                    <SuccinctTimeReport
                      key={`route-shortcut-${idx}`}
                      routeId={selectedRoute}
                    />
                  )
              )}
          </List>
        ) : (
          <CircularProgress sx={{ my: 10 }} />
        ),
      [selectedRoutes]
    );

    const SavedRouteList = useMemo(() => {
      if (selectedRoutes === null) {
        return <CircularProgress sx={{ my: 10 }} />;
      }
      const savedRoutes = selectedRoutes["saved"].split("|");
      const noRoutes = savedRoutes.every((routeId) => !routeId);

      return (
        <React.Fragment>
          {noRoutes ? (
            <Typography sx={{ marginTop: 5 }}>
              <b>{t("未有收藏路線")}</b>
            </Typography>
          ) : (
            <List disablePadding>
              {selectedRoutes["saved"]
                .split("|")
                .map(
                  (selectedRoute, idx) =>
                    Boolean(selectedRoute) && (
                      <SuccinctTimeReport
                        key={`route-shortcut-${idx}`}
                        routeId={selectedRoute}
                      />
                    )
                )}
            </List>
          )}
        </React.Fragment>
      );
    }, [selectedRoutes, t]);

    const NearbyRouteList = useMemo(
      () =>
        selectedRoutes ? (
          <List disablePadding>
            {selectedRoutes["nearby"]
              .split("|")
              .map(
                (selectedRoute, idx) =>
                  Boolean(selectedRoute) && (
                    <SuccinctTimeReport
                      key={`route-shortcut-${idx}`}
                      routeId={selectedRoute}
                    />
                  )
              )}
          </List>
        ) : (
          <CircularProgress sx={{ my: 10 }} />
        ),
      [selectedRoutes]
    );

    const CollectionRouteList = useMemo(
      () =>
        selectedRoutes?.collections.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {selectedRoutes.collections.map(({ name, routes }, idx) => (
              <Box key={`collection-${idx}`}>
                <Typography variant="body1" sx={{ textAlign: "left" }}>
                  <b>{name}</b>
                </Typography>
                <List disablePadding>
                  {routes
                    .split("|")
                    .map(
                      (selectedRoute, idx) =>
                        Boolean(selectedRoute) && (
                          <SuccinctTimeReport
                            key={`route-shortcut-${idx}`}
                            routeId={selectedRoute}
                          />
                        )
                    )}
                </List>
                {routes.split("|").filter((v) => Boolean(v)).length === 0 && (
                  <Typography sx={{ marginTop: 1 }}>
                    {t("未有收藏路線")}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ marginTop: 5 }}>
            <b>{t("未有收藏路線")}</b>
          </Typography>
        ),
      [t, selectedRoutes]
    );

    return useMemo(
      () => (
        <SwipeableViews
          index={HOME_TAB.indexOf(defaultHometab.current)}
          onChangeIndex={(idx) => {
            console.log(idx);
            onChangeTab(HOME_TAB[idx]);
          }}
        >
          {BothRouteList}
          {SavedRouteList}
          {NearbyRouteList}
          {CollectionRouteList}
        </SwipeableViews>
      ),
      [
        onChangeTab,
        BothRouteList,
        SavedRouteList,
        NearbyRouteList,
        CollectionRouteList,
      ]
    );
  }
);

export default SwipeableList;

const HOME_TAB = ["both", "saved", "nearby", "collections"];

const getSelectedRoutes = ({
  hotRoute,
  savedEtas,
  collections,
  geolocation,
  stopList,
  routeList,
  isRouteFilter,
  isTodayHoliday,
}: {
  hotRoute: Record<string, number>;
  savedEtas: string[];
  collections: RouteCollection[];
  geolocation: Location;
  stopList: StopList;
  routeList: RouteList;
  isRouteFilter: boolean;
  isTodayHoliday: boolean;
}): SelectedRoutes => {
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
    .map((routeUrl, idx, self): [string, number, number] => {
      const [routeId, stopIdx] = routeUrl.split("/");
      // TODO: taking the longest stop array to avoid error, should be fixed in the database
      const stop =
        stopList[
          Object.values(routeList[routeId].stops).sort(
            (a, b) => b.length - a.length
          )[0][stopIdx]
        ];
      return [
        routeUrl,
        getDistance(geolocation, stop.location),
        self.length - idx,
      ];
    });

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
    .slice(0, 20)
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

  const collectionRoutes = collections
    // check if collection should be shown at the moment
    .filter(({ schedules }) =>
      schedules.reduce((acc, { day, start, end }) => {
        if (acc) return acc;
        const curDate = new Date();
        curDate.setUTCHours(curDate.getUTCHours() + 8);
        const _day = curDate.getUTCDay();
        // skip handling timezone here
        if ((isTodayHoliday && day === 0) || day === _day) {
          let sTs = start.hour * 60 + start.minute;
          let eTs = end.hour * 60 + end.minute;
          let curTs =
            (curDate.getUTCHours() * 60 + curDate.getUTCMinutes()) % 1440;
          return sTs <= curTs && curTs <= eTs;
        }
        return false;
      }, false)
    )
    .reduce((acc, cur) => {
      acc.push({
        name: cur.name,
        routes: cur.list,
      });
      return acc;
    }, []);

  const formatHandling = (routes) => {
    return routes
      .filter((v, i, s) => s.indexOf(v) === i) // uniqify
      .filter((routeUrl) => {
        const [routeId] = routeUrl.split("/");
        return (
          routeList[routeId] &&
          (!isRouteFilter ||
            isRouteAvaliable(routeId, routeList[routeId].freq, isTodayHoliday))
        );
      })
      .concat(Array(40).fill("")) // padding
      .slice(0, 40)
      .join("|");
  };

  return {
    saved: formatHandling(
      selectedRoutes
        .sort((a, b) => a[2] - b[2])
        .map((v) => v[0])
        .slice(0, 40)
    ),
    nearby: formatHandling(nearbyRoutes),
    both: formatHandling(
      []
        .concat(
          selectedRoutes
            .sort((a, b) => a[1] - b[1])
            .map((v) => v[0])
            .slice(0, 40)
        )
        .concat(nearbyRoutes)
    ),
    collections: collectionRoutes.map((v) => ({
      ...v,
      routes: formatHandling(v.routes),
    })),
  };
};
