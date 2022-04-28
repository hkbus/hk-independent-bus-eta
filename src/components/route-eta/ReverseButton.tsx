import React, { useContext, useMemo, useCallback } from "react";
import { Button, Divider, SxProps, Theme } from "@mui/material";
import { SyncAlt as SyncAltIcon } from "@mui/icons-material";
import { RouteListEntry } from "hk-bus-eta";
import { useHistory } from "react-router-dom";
import { vibrate, getDistance } from "../../utils";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";

const ReverseButton = ({ routeId }: { routeId: string }) => {
  const { t, i18n } = useTranslation();
  const {
    db: { routeList, holidays, stopList },
    vibrateDuration,
  } = useContext(AppContext);
  const { route, stops, orig, dest, nlbId, freq, jt, co } = routeList[routeId];
  const history = useHistory();

  const isTodayHoliday = useMemo(
    () => isHoliday(holidays, new Date()),
    [holidays]
  );

  const reverseRoute = useMemo(
    () =>
      Object.entries(routeList)
        .reduce<Array<[string, RouteListEntry]>>(
          (acc, [key, _routeListEntry]) => {
            if (key === routeId) return acc;
            const { co: _co, route: _route } = _routeListEntry;
            if (
              _route === route &&
              JSON.stringify(co) === JSON.stringify(_co)
            ) {
              return [...acc, [key, _routeListEntry]];
            }
            return acc;
          },
          []
        )
        .sort(([, a], [, b]) =>
          isRouteAvaliable(a.route, a.freq, isTodayHoliday) <
          isRouteAvaliable(b.route, b.freq, isTodayHoliday)
            ? -1
            : 1
        )
        .sort(([, a], [, b]) => {
          const refOrig = stopList[Object.values(stops)[0][0]];
          const aOrig = stopList[Object.values(a.stops)[0][0]];
          const bOrig = stopList[Object.values(b.stops)[0][0]];
          return getDistance(aOrig.location, refOrig.location) <
            getDistance(bOrig.location, refOrig.location)
            ? -1
            : 1;
        }),
    [route, co, routeList, stopList, isTodayHoliday, routeId, stops]
  );

  const handleRevserClick = useCallback(
    (e) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      setTimeout(() => {
        history.push(
          `/${i18n.language}/route/${reverseRoute[0][0].toLowerCase()}`
        );
      }, 0);
    },
    [reverseRoute, history, i18n.language, vibrateDuration]
  );
  return (
    reverseRoute.length >= 0 && (
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
