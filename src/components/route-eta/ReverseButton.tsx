import React, { useContext, useMemo, useCallback } from "react";
import { Button, Divider, SxProps, Theme } from "@mui/material";
import { SyncAlt as SyncAltIcon } from "@mui/icons-material";
import type { RouteListEntry } from "hk-bus-eta";
import { useRouter } from "next/router";
import { vibrate, getDistance } from "../../utils";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";

const ReverseButton = ({
  routeId,
  routeListEntry,
}: {
  routeId: string;
  routeListEntry: RouteListEntry;
}) => {
  const { t, i18n } = useTranslation();
  const { db, vibrateDuration } = useContext(AppContext);
  const { route, stops, co } = routeListEntry;
  const router = useRouter();

  const isTodayHoliday = useMemo(
    () => isHoliday(db.holidays ?? [], new Date()),
    [db.holidays]
  );

  const reverseRoute = useMemo(() => {
    if (db.routeList === undefined || db.stopList === undefined) {
      return [];
    }
    return Object.entries(db.routeList)
      .reduce<Array<[string, RouteListEntry]>>(
        (acc, [key, _routeListEntry]) => {
          if (key === routeId) return acc;
          const { co: _co, route: _route } = _routeListEntry;
          if (_route === route && JSON.stringify(co) === JSON.stringify(_co)) {
            return [...acc, [key, _routeListEntry]];
          }
          return acc;
        },
        []
      )
      .sort(([, a], [, b]) => {
        const aAval = isRouteAvaliable(a.route, a.freq, isTodayHoliday);
        const bAval = isRouteAvaliable(b.route, b.freq, isTodayHoliday);
        if (aAval === bAval) {
          const refOrig = db.stopList[Object.values(stops)[0][0]];
          // calculate distance between starting stop of reference route and candidate route A
          const aOrig = db.stopList[Object.values(a.stops)[0][0]];
          const aDist = getDistance(aOrig.location, refOrig.location);
          // calculate distance between starting stop of reference route and candidate route B
          const bOrig = db.stopList[Object.values(b.stops)[0][0]];
          const bDist = getDistance(bOrig.location, refOrig.location);
          // pick furtherest one
          return aDist > bDist ? -1 : 1;
        }
        // compare boolean, available route first
        return aAval > bAval ? -1 : 1;
      })
      .map(([_routeId]) => _routeId)
      .filter((_routeId) => _routeId.toLowerCase() !== routeId);
  }, [db.routeList, db.stopList, routeId, route, co, isTodayHoliday, stops]);

  const handleRevserClick = useCallback(
    (e) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      setTimeout(() => {
        router.push(`/${i18n.language}/route/${reverseRoute[0].toLowerCase()}`);
      }, 0);
    },
    [i18n.language, reverseRoute, router, vibrateDuration]
  );

  return (
    reverseRoute.length > 0 && (
      <>
        <Divider orientation="vertical" sx={buttonDividerSx} />
        <Button
          variant="text"
          aria-label="open-timetable"
          sx={buttonSx}
          size="small"
          startIcon={<SyncAltIcon />}
          onClick={handleRevserClick}
        >
          {t("對頭線")}
        </Button>
      </>
    )
  );
};

export default ReverseButton;

const buttonDividerSx: SxProps<Theme> = {
  position: "absolute",
  top: "0",
  left: "calc(64px + 2%)",
};

const buttonSx: SxProps<Theme> = {
  color: (theme) =>
    theme.palette.getContrastText(theme.palette.background.default),
  position: "absolute",
  top: "0",
  left: "2%",
  flexDirection: "column",
  justifyContent: "center",
  "& > .MuiButton-label": {
    flexDirection: "column",
    justifyContent: "center",
  },
  "& > .MuiButton-startIcon": {
    margin: 0,
  },
};
