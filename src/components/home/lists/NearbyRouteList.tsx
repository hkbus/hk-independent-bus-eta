import { Box, SxProps, Theme, Typography } from "@mui/material";
import HomeRouteListDropDown from "./HomeRouteListDropDown";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useMemo, useState } from "react";
import { TransportType } from "../../../typing";
import {
  EtaDb,
  Location,
  RouteList,
  StopList,
  StopListEntry,
} from "hk-bus-eta";
import { coToType, formatHandling, getDistance } from "../../../utils";
import AppContext from "../../../AppContext";
import throttle from "lodash.throttle";

interface NearbyRouteListProps {
  isFocus: boolean;
}

const NearbyRouteList = ({ isFocus }: NearbyRouteListProps) => {
  const { t } = useTranslation();
  const {
    manualGeolocation,
    geolocation,
    db: { routeList, stopList, serviceDayMap },
    isRouteFilter,
    isTodayHoliday,
    searchRange,
  } = useContext(AppContext);

  // throttle to avoid rapidly UI changes due to geolocation changes
  const [state, setState] = useState<Location>(
    manualGeolocation ?? geolocation
  );
  const throttleUpdateGeolocation = useMemo(
    () =>
      throttle((geolocation: Location) => {
        setState(geolocation);
      }, 1000),
    []
  );

  useEffect(() => {
    throttleUpdateGeolocation(manualGeolocation ?? geolocation);
  }, [manualGeolocation, geolocation, throttleUpdateGeolocation]);

  const routes = useMemo(
    () =>
      getRoutes({
        geolocation: state,
        stopList,
        routeList,
        isRouteFilter,
        isTodayHoliday,
        serviceDayMap,
        searchRange,
      }),
    [
      state,
      stopList,
      routeList,
      isRouteFilter,
      isTodayHoliday,
      serviceDayMap,
      searchRange,
    ]
  );

  const noNearbyRoutes = useMemo(
    () =>
      Object.values(routes)
        .map((nearbyRoutes) =>
          nearbyRoutes.split("|").every((item) => item === "")
        )
        .every(Boolean),
    [routes]
  );

  if (!isFocus) {
    return <></>;
  }

  if (noNearbyRoutes) {
    return (
      <Box sx={rootSx}>
        <Typography sx={{ marginTop: 5 }} fontWeight="700">
          {t("附近未有任何路線")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={rootSx}>
      {Object.entries(routes).map(([type, nearbyRoutes]) => (
        <HomeRouteListDropDown
          key={`nearby-${type}`}
          name={t(type)}
          routeStrings={nearbyRoutes}
        />
      ))}
    </Box>
  );
};

export default NearbyRouteList;

const getRoutes = ({
  geolocation,
  stopList,
  routeList,
  isRouteFilter,
  isTodayHoliday,
  serviceDayMap,
  searchRange,
}: {
  geolocation: Location;
  stopList: StopList;
  routeList: RouteList;
  isRouteFilter: boolean;
  isTodayHoliday: boolean;
  serviceDayMap: EtaDb["serviceDayMap"];
  searchRange: number;
}): Partial<Record<TransportType, string>> => {
  const nearbyRoutes = Object.entries(stopList)
    .map((stop: [string, StopListEntry]): [string, StopListEntry, number] =>
      // potentially could be optimized by other distance function
      [...stop, getDistance(stop[1].location, geolocation)]
    )
    .filter(
      (stop) =>
        // keep only nearby 1000m stops
        stop[2] < searchRange
    )
    .sort((a, b) => a[2] - b[2])
    .slice(0, 20)
    .reduce(
      (acc, [stopId]) => {
        Object.entries(routeList).forEach(([key, route]) => {
          ["kmb", "lrtfeeder", "lightRail", "gmb", "ctb", "nlb"].forEach(
            (co) => {
              if (route.stops[co] && route.stops[co].includes(stopId)) {
                if (acc[coToType[co]] === undefined) acc[coToType[co]] = [];
                acc[coToType[co]].push(
                  key + "/" + route.stops[co].indexOf(stopId)
                );
              }
            }
          );
        });
        return acc;
      },
      { bus: [], mtr: [], lightRail: [], minibus: [] }
    );

  return Object.entries(nearbyRoutes).reduce((acc, [type, nearbyRoutes]) => {
    acc[type] = formatHandling(
      nearbyRoutes,
      isTodayHoliday,
      isRouteFilter,
      routeList,
      stopList,
      serviceDayMap,
      geolocation
    );
    return acc;
  }, {});
};

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flex: 1,
  minHeight: "100dvh",
};
