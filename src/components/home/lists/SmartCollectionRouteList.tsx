import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import HomeRouteListDropDown from "./HomeRouteListDropDown";
import { EtaDb, Location, RouteList, StopList } from "hk-bus-eta";
import { RouteCollection } from "../../../typing";
import { formatHandling } from "../../../utils";
import { useContext, useMemo } from "react";
import AppContext from "../../../AppContext";

interface SmartCollectionRouteListProps {
  isFocus: boolean;
}

const SmartCollectionRouteList = ({
  isFocus,
}: SmartCollectionRouteListProps) => {
  const { t } = useTranslation();

  const {
    collections: _collections,
    geolocation,
    db: { routeList, stopList, serviceDayMap },
    isRouteFilter,
    isTodayHoliday,
  } = useContext(AppContext);

  const collections = useMemo(
    () =>
      getCollections({
        collections: _collections,
        geolocation,
        stopList,
        routeList,
        isRouteFilter,
        isTodayHoliday,
        serviceDayMap,
      }),
    [
      _collections,
      geolocation,
      stopList,
      routeList,
      isRouteFilter,
      isTodayHoliday,
      serviceDayMap,
    ]
  );

  if (!isFocus) {
    return <></>;
  }

  if (collections.length === 0) {
    return (
      <Typography sx={{ marginTop: 5 }} fontWeight={700}>
        {t("未有收藏路線")}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {collections.map(({ name, routes, defaultExpanded }, idx) => (
        <HomeRouteListDropDown
          key={`collection-${idx}`}
          name={name}
          routeStrings={routes}
          defaultExpanded={defaultExpanded}
        />
      ))}
      {!collections.reduce(
        (acc, { routes }) =>
          acc || routes.split("|").filter((v) => Boolean(v)).length > 0,
        false
      ) && (
        <Typography sx={{ marginTop: 5 }} fontWeight={700}>
          {t("未有收藏路線")}
        </Typography>
      )}
    </Box>
  );
};

export default SmartCollectionRouteList;

const getCollections = ({
  collections,
  geolocation,
  stopList,
  routeList,
  isRouteFilter,
  isTodayHoliday,
  serviceDayMap,
}: {
  collections: RouteCollection[];
  geolocation: Location;
  stopList: StopList;
  routeList: RouteList;
  isRouteFilter: boolean;
  isTodayHoliday: boolean;
  serviceDayMap: EtaDb["serviceDayMap"];
}): Array<{
  name: string;
  routes: string;
  defaultExpanded: boolean;
}> => {
  return collections
    .reduce((acc, { name, list, schedules }) => {
      acc.push({
        name: name,
        routes: list,
        defaultExpanded: schedules.reduce((acc, { day, start, end }) => {
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
        }, false),
      });
      return acc;
    }, [])
    .map((v) => ({
      ...v,
      routes: formatHandling(
        v.routes,
        isTodayHoliday,
        isRouteFilter,
        routeList,
        stopList,
        serviceDayMap,
        geolocation
      ),
    }));
};
