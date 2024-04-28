import { useContext, useMemo, useCallback } from "react";
import { Button, Divider, SxProps, Theme } from "@mui/material";
import { SyncAlt as SyncAltIcon } from "@mui/icons-material";
import { RouteListEntry } from "hk-bus-eta";
import { useNavigate } from "react-router-dom";
import { vibrate, getDistance } from "../../utils";
import { useTranslation } from "react-i18next";
import AppContext from "../../context/AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";
import useLanguage from "../../hooks/useTranslation";
import DbContext from "../../context/DbContext";

interface ReverseButtonProps {
  routeId: string;
  stopId: string;
}

const ReverseButton = ({ routeId, stopId }: ReverseButtonProps) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const {
    db: { routeList, holidays, stopList, serviceDayMap },
  } = useContext(DbContext);
  const { vibrateDuration } = useContext(AppContext);
  const { route, stops, co, gtfsId } = routeList[routeId];
  const navigate = useNavigate();

  const isTodayHoliday = useMemo(
    () => isHoliday(holidays, new Date()),
    [holidays]
  );

  const reverseRouteUrl = useMemo(() => {
    const reverseRoute = Object.entries(routeList)
      .reduce<Array<[string, RouteListEntry]>>(
        (acc, [key, _routeListEntry]) => {
          if (key === routeId) return acc;
          const { co: _co, route: _route, gtfsId: _gtfsId } = _routeListEntry;
          if (co[0] === "gmb" && gtfsId && gtfsId !== _gtfsId) {
            return acc;
          }
          if (_route === route && JSON.stringify(co) === JSON.stringify(_co)) {
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
      .filter((_routeId) => _routeId.toLowerCase() !== routeId);
    if (reverseRoute.length === 0) {
      return null;
    }

    const curStop = stopList[stopId].location;
    let stopIds = Object.values(routeList[reverseRoute[0]].stops)[0];
    let stopIdx = -1;
    let minDist = 9999999;
    for (let i = 0; i < stopIds.length; ++i) {
      let dist = getDistance(curStop, stopList[stopIds[i]].location);
      if (dist < minDist) {
        minDist = dist;
        stopIdx = i;
      }
    }
    return `/${language}/route/${reverseRoute[0].toLowerCase()}/${stopIds[stopIdx]}%2C${stopIdx}`;
  }, [
    route,
    co,
    gtfsId,
    routeList,
    stopList,
    isTodayHoliday,
    routeId,
    stops,
    serviceDayMap,
    language,
    stopId,
  ]);

  const handleRevserClick = useCallback(
    (url: string | null) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (url) {
        vibrate(vibrateDuration);
        navigate(url);
      }
    },
    [navigate, vibrateDuration]
  );

  return (
    reverseRouteUrl && (
      <>
        <Divider orientation="vertical" sx={buttonDividerSx} />
        <Button
          variant="text"
          aria-label="open-timetable"
          sx={buttonSx}
          size="small"
          startIcon={<SyncAltIcon />}
          onClick={handleRevserClick(reverseRouteUrl)}
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
  top: 0,
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
