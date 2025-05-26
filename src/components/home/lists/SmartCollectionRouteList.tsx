import { Box, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import HomeRouteListDropDown from "./HomeRouteListDropDown";
import { EtaDb, Location, RouteList, StopList } from "hk-bus-eta";
import { RouteCollection } from "../../../@types/types";
import { formatHandling } from "../../../utils";
import { useContext, useMemo } from "react";
import AppContext from "../../../context/AppContext";
import DbContext from "../../../context/DbContext";
import CollectionContext from "../../../CollectionContext";

interface SmartCollectionRouteListProps {
  isFocus: boolean;
}

const SmartCollectionRouteList = ({
  isFocus,
}: SmartCollectionRouteListProps) => {
  const { t } = useTranslation();

  const { geolocation, isRouteFilter } = useContext(AppContext);
  const { collections: _collections } = useContext(CollectionContext);
  const {
    db: { routeList, stopList, serviceDayMap },
    isTodayHoliday,
  } = useContext(DbContext);

  const collections = useMemo(
    () =>
      getCollections({
        collections: _collections,
        geolocation: geolocation.current,
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
      <Box sx={rootSx}>
        <Typography sx={{ marginTop: 5 }} fontWeight={700}>
          {t("未有收藏路線")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={rootSx}>
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

interface ParsedCollection {
  name: string;
  routes: string;
  defaultExpanded: boolean;
}

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
}): Array<ParsedCollection> => {
  return collections
    .map(({ name, list, schedules }) => ({
      name: name,
      routes: list,
      defaultExpanded: schedules.reduce((acc, { day, start, end }) => {
        if (acc) return acc;
        const curDate = new Date();
        curDate.setUTCHours(curDate.getUTCHours() + 8);
        const _day = curDate.getUTCDay();
        // skip handling timezone here
        // holiday -1; sun-0, mon-1, tue-2, wed-3, thu-4, fri-5, sat-6
        if ((isTodayHoliday && day === -1) || day === _day) {
          let sTs = start.hour * 60 + start.minute;
          let eTs = end.hour * 60 + end.minute;
          let curTs =
            (curDate.getUTCHours() * 60 + curDate.getUTCMinutes()) % 1440;
          return sTs <= curTs && curTs <= eTs;
        }
        return false;
      }, false),
    }))
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

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minHeight: "100dvh",
};
