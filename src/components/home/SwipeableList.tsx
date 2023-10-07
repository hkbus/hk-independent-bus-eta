import React, {
  useContext,
  useMemo,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
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
  saved: string;
  nearby: string;
  smartCollections: Array<{ name: string; routes: string }>;
  collections: string[];
}

const SwipeableList = React.forwardRef<SwipeableListRef, SwipeableListProps>(
  ({ geolocation, homeTab, onChangeTab }, ref) => {
    const {
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
              {savedRoutes.map(
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

    const SmartCollectionRouteList = useMemo(
      () =>
        selectedRoutes?.smartCollections.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {selectedRoutes.smartCollections.map(({ name, routes }, idx) => (
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

    const collectionRouteLists = useMemo(
      () =>
        collections.map((_, idx) => {
          const routes = selectedRoutes?.collections[idx].split("|") ?? [];
          const noRoutes = routes.every((routeId) => !routeId);

          return (
            <React.Fragment key={`collection-route-${idx}`}>
              {noRoutes ? (
                <Typography sx={{ marginTop: 5 }}>
                  <b>{t("收藏中未有路線")}</b>
                </Typography>
              ) : (
                <List disablePadding>
                  {routes.map(
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
        }),
      [t, collections, selectedRoutes]
    );

    const getViewIdx = useCallback(() => {
      let ret = HOME_TAB.indexOf(defaultHometab.current);
      if (ret !== -1) return ret;
      for (let i = 0; i < collections.length; ++i) {
        if (`collection-${i}` === defaultHometab.current) {
          return i + HOME_TAB.length;
        }
      }
      return -1;
    }, [collections]);

    return useMemo(
      () => (
        <SwipeableViews
          index={getViewIdx()}
          onChangeIndex={(idx) => {
            onChangeTab(
              idx < HOME_TAB.length
                ? HOME_TAB[idx]
                : `collection-${idx - HOME_TAB.length}`
            );
          }}
        >
          {NearbyRouteList}
          {SavedRouteList}
          {SmartCollectionRouteList}
          {collectionRouteLists?.map((Collection) => Collection)}
        </SwipeableViews>
      ),
      [
        onChangeTab,
        getViewIdx,
        SavedRouteList,
        NearbyRouteList,
        SmartCollectionRouteList,
        collectionRouteLists,
      ]
    );
  }
);

export default SwipeableList;

const HOME_TAB = ["nearby", "saved", "collections"];

const getSelectedRoutes = ({
  savedEtas,
  collections,
  geolocation,
  stopList,
  routeList,
  isRouteFilter,
  isTodayHoliday,
}: {
  savedEtas: string[];
  collections: RouteCollection[];
  geolocation: Location;
  stopList: StopList;
  routeList: RouteList;
  isRouteFilter: boolean;
  isTodayHoliday: boolean;
}): SelectedRoutes => {
  const selectedRoutes = savedEtas
    .filter((routeUrl, index, self) => {
      return (
        self.indexOf(routeUrl) === index && routeUrl.split("/")[0] in routeList
      );
    })
    .map((routeUrl, idx, self): [string, number, number] => {
      const [routeId, stopIdx] = routeUrl.split("/");
      // TODO: taking the longest stop array to avoid error, should be fixed in the database
      const _stops = Object.values(routeList[routeId].stops).sort(
        (a, b) => b.length - a.length
      )[0];
      if (stopIdx !== undefined) {
        // if specified which stop
        return [
          routeUrl,
          getDistance(geolocation, stopList[_stops[stopIdx]].location),
          self.length - idx,
        ];
      } else {
        // else find the nearest stop
        const stop = _stops
          .map((stop) => [
            stop,
            getDistance(geolocation, stopList[stop].location),
          ])
          .sort(([, a], [, b]) => (a < b ? -1 : 1))[0][0];
        return [
          routeUrl,
          getDistance(geolocation, stopList[stop].location),
          self.length - idx,
        ];
      }
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
      .map((routeUrl) => {
        // handling for saved route without specified stop, use the nearest one
        const [routeId, stopIdx] = routeUrl.split("/");
        if (stopIdx !== undefined) return routeUrl;
        const _stops = Object.values(routeList[routeId].stops).sort(
          (a, b) => b.length - a.length
        )[0];
        const stop = _stops
          .map((stop) => [
            stop,
            getDistance(geolocation, stopList[stop].location),
          ])
          .sort(([, a], [, b]) => (a < b ? -1 : 1))[0][0];
        return `${routeUrl}/${_stops.indexOf(stop as string)}`;
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
    smartCollections: collectionRoutes.map((v) => ({
      ...v,
      routes: formatHandling(v.routes),
    })),
    collections: collections.map((colleciton) =>
      formatHandling(colleciton.list)
    ),
  };
};
