import { List, Typography } from "@mui/material";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import SuccinctTimeReport from "../SuccinctTimeReport";
import {
  type EtaDb,
  type Location,
  type RouteList,
  type StopList,
} from "hk-bus-eta";
import { formatHandling, getDistance } from "../../../utils";
import AppContext from "../../../AppContext";

interface SavedRouteListProps {
  isFocus: boolean;
}

const SavedRouteList = ({ isFocus }: SavedRouteListProps) => {
  const { t } = useTranslation();
  const {
    savedEtas,
    geolocation,
    db: { routeList, stopList, serviceDayMap },
    isRouteFilter,
    isTodayHoliday,
  } = useContext(AppContext);

  const savedRoutes = useMemo(
    () =>
      getRoutes({
        savedEtas,
        geolocation,
        stopList,
        routeList,
        isRouteFilter,
        isTodayHoliday,
        serviceDayMap,
      }),
    [
      savedEtas,
      geolocation,
      routeList,
      stopList,
      isRouteFilter,
      isTodayHoliday,
      serviceDayMap,
    ]
  );
  const noRoutes = useMemo(
    () => savedRoutes.every((routeId) => !routeId),
    [savedRoutes]
  );

  if (!isFocus) {
    return <></>;
  }

  if (noRoutes) {
    return (
      <Typography sx={{ marginTop: 5 }}>
        <b>{t("未有收藏路線")}</b>
      </Typography>
    );
  }

  return (
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
  );
};

export default SavedRouteList;

const getRoutes = ({
  savedEtas,
  geolocation,
  stopList,
  routeList,
  isRouteFilter,
  isTodayHoliday,
  serviceDayMap,
}: {
  savedEtas: string[];
  geolocation: Location;
  stopList: StopList;
  routeList: RouteList;
  isRouteFilter: boolean;
  isTodayHoliday: boolean;
  serviceDayMap: EtaDb["serviceDayMap"];
}): string[] =>
  formatHandling(
    savedEtas
      .filter((routeUrl, index, self) => {
        return (
          self.indexOf(routeUrl) === index &&
          routeUrl.split("/")[0] in routeList
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
      })
      .sort((a, b) => a[2] - b[2])
      .map((v) => v[0])
      .slice(0, 40),
    isTodayHoliday,
    isRouteFilter,
    routeList,
    stopList,
    serviceDayMap,
    geolocation
  ).split("|");
