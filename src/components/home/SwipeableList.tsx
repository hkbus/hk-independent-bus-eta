import React, { useContext, useMemo, useRef, useImperativeHandle } from "react";
import SwipeableViews from "react-swipeable-views";
import { List, Typography } from "@mui/material";
import { Location, RouteList, StopListEntry, StopList } from "hk-bus-eta";

import AppContext from "../../AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";
import { getDistance } from "../../utils";
import SuccinctTimeReport from "./SuccinctTimeReport";
import type { HomeTabType } from "./HomeTabbar";
import { useTranslation } from "react-i18next";

interface SwipeableListProps {
  geolocation: Location;
  homeTab: HomeTabType;
  onChangeTab: (v: string) => void;
}

interface SwipeableListRef {
  changeTab: (v: HomeTabType) => void;
}

const SwipeableList = React.forwardRef<SwipeableListRef, SwipeableListProps>(
  ({ geolocation, homeTab, onChangeTab }, ref) => {
    const {
      hotRoute,
      savedEtas,
      db: { holidays, routeList, stopList },
      isRouteFilter,
    } = useContext(AppContext);
    const isTodayHoliday = useMemo(
      () => isHoliday(holidays, new Date()),
      [holidays]
    );
    const defaultHometab = useRef(homeTab);
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      changeTab: (v) => {
        defaultHometab.current = v;
      },
    }));

    const selectedRoutes = useMemo(
      () =>
        ["both", "saved", "nearby"].reduce(
          (acc, homeTab: "both" | "saved" | "nearby") => ({
            ...acc,
            [homeTab]: getSelectedRoutes({
              geolocation,
              hotRoute,
              savedEtas,
              routeList,
              stopList,
              isRouteFilter,
              isTodayHoliday,
              homeTab,
              sortByDist: homeTab !== "saved",
            }),
          }),
          {}
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [geolocation]
    );

    const BothRouteList = useMemo(
      () => (
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
      ),
      [selectedRoutes]
    );

    const SavedRouteList = useMemo(() => {
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
      () => (
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
      ),
      [selectedRoutes]
    );

    return useMemo(
      () => (
        <SwipeableViews
          index={HOME_TAB.indexOf(defaultHometab.current)}
          onChangeIndex={(idx) => {
            onChangeTab(HOME_TAB[idx]);
          }}
        >
          {BothRouteList}
          {SavedRouteList}
          {NearbyRouteList}
        </SwipeableViews>
      ),
      [onChangeTab, BothRouteList, SavedRouteList, NearbyRouteList]
    );
  }
);

export default SwipeableList;

const HOME_TAB = ["both", "saved", "nearby"];

const getSelectedRoutes = ({
  hotRoute,
  savedEtas,
  geolocation,
  stopList,
  routeList,
  isRouteFilter,
  isTodayHoliday,
  homeTab,
  sortByDist,
}: {
  hotRoute: Record<string, number>;
  savedEtas: string[];
  geolocation: Location;
  stopList: StopList;
  routeList: RouteList;
  isRouteFilter: boolean;
  isTodayHoliday: boolean;
  homeTab: "both" | "saved" | "nearby";
  sortByDist: boolean;
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
    .map((routeUrl, idx, self): [string, number] => {
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
        sortByDist
          ? getDistance(geolocation, stop.location)
          : self.length - idx,
      ];
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
