import { List, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import SuccinctTimeReport from "../SuccinctTimeReport";
import { EtaDb, Location, RouteList, StopList } from "hk-bus-eta";
import { formatHandling } from "../../../utils";
import { useContext, useMemo } from "react";
import AppContext from "../../../AppContext";
import { RouteCollection } from "../../../typing";

interface CollectionRouteListProps {
  collection: RouteCollection;
  isFocus: boolean;
}

const CollectionRouteList = ({
  collection,
  isFocus,
}: CollectionRouteListProps) => {
  const { t } = useTranslation();
  const {
    geolocation,
    db: { routeList, stopList, serviceDayMap },
    isRouteFilter,
    isTodayHoliday,
  } = useContext(AppContext);

  const routes = useMemo(
    () =>
      getRoutes({
        savedEtas: collection.list,
        geolocation,
        stopList,
        routeList,
        isRouteFilter,
        isTodayHoliday,
        serviceDayMap,
      }),
    [
      collection,
      geolocation,
      stopList,
      routeList,
      isRouteFilter,
      isTodayHoliday,
      serviceDayMap,
    ]
  );

  const noRoutes = useMemo(() => routes.every((routeId) => !routeId), [routes]);

  if (!isFocus) {
    return <></>;
  }

  if (noRoutes) {
    return (
      <Typography sx={{ marginTop: 5 }}>
        <b>{t("收藏中未有路線")}</b>
      </Typography>
    );
  }

  return (
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
  );
};

export default CollectionRouteList;

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
    savedEtas,
    isTodayHoliday,
    isRouteFilter,
    routeList,
    stopList,
    serviceDayMap,
    geolocation
  ).split("|");
