import { useContext, useMemo, useCallback } from "react";
import { Button, SxProps, Theme } from "@mui/material";
import { SyncAlt as SyncAltIcon } from "@mui/icons-material";
import { RouteListEntry } from "hk-bus-eta";
import { useNavigate } from "react-router-dom";
import { vibrate, getDistance } from "../../utils";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";

const ReverseButton = ({ routeId }: { routeId: string }) => {
  const { t, i18n } = useTranslation();
  const {
    db: { routeList, holidays, stopList, serviceDayMap },
    vibrateDuration,
  } = useContext(AppContext);
  const { route, stops, co, gtfsId } = routeList[routeId];
  const navigate = useNavigate();

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
            const { co: _co, route: _route, gtfsId: _gtfsId } = _routeListEntry;
            if (co[0] === "gmb" && gtfsId && gtfsId !== _gtfsId) {
              return acc;
            }
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
        .sort(([, a], [, b]) => {
          const aAval = isRouteAvaliable(
            a.route,
            a.freq,
            isTodayHoliday,
            serviceDayMap
          );
          const bAval = isRouteAvaliable(
            b.route,
            b.freq,
            isTodayHoliday,
            serviceDayMap
          );
          if (aAval === bAval) {
            const refOrig = stopList[Object.values(stops)[0][0]];
            const refDest = stopList[Object.values(stops)[0].slice(-1)[0]];
            // calculate distance between starting stop of reference route and candidate route A
            const aOrig = stopList[Object.values(a.stops)[0][0]];
            const aDest = stopList[Object.values(a.stops)[0].slice(-1)[0]];
            const aDist =
              getDistance(aOrig.location, refDest.location) +
              getDistance(refOrig.location, aDest.location);
            // calculate distance between starting stop of reference route and candidate route B
            const bOrig = stopList[Object.values(b.stops)[0][0]];
            const bDest = stopList[Object.values(b.stops)[0].slice(-1)[0]];
            const bDist =
              getDistance(bOrig.location, refDest.location) +
              getDistance(refOrig.location, bDest.location);
            // pick furtherest one
            return aDist < bDist ? -1 : 1;
          }
          // compare boolean, available route first
          return aAval > bAval ? -1 : 1;
        })
        .map(([_routeId]) => _routeId)
        .filter((_routeId) => _routeId.toLowerCase() !== routeId),
    [
      route,
      co,
      gtfsId,
      routeList,
      stopList,
      isTodayHoliday,
      routeId,
      stops,
      serviceDayMap,
    ]
  );

  const handleRevserClick = useCallback(
    (e) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      setTimeout(() => {
        navigate(`/${i18n.language}/route/${reverseRoute[0].toLowerCase()}`);
      }, 0);
    },
    [reverseRoute, navigate, i18n.language, vibrateDuration]
  );

  return (
    reverseRoute.length > 0 && (
      <>
        <Button
          variant="text"
          aria-label="reverse"
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

const buttonSx: SxProps<Theme> = {
  color: (theme) =>
    theme.palette.getContrastText(theme.palette.background.default),
  flexDirection: "column",
  justifyContent: "center",
  minWidth: "50px",
  "& > .MuiButton-label": {
    flexDirection: "column",
    justifyContent: "center",
  },
  "& > .MuiButton-startIcon": {
    margin: 0,
  },
};
