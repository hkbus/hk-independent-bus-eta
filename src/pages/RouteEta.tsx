import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import RouteMap from "../components/route-eta/RouteMap";
import StopAccordions from "../components/route-eta/StopAccordions";
import StopDialog from "../components/route-eta/StopDialog";
import { Button, Divider, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import AppContext from "../AppContext";
import { useTranslation } from "react-i18next";
import RouteNo from "../components/route-list/RouteNo";
import { setSeoHeader, toProperCase, getDistance } from "../utils";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TimetableDrawer from "../components/route-eta/TimetableDrawer";
import Leaflet from "leaflet";
import type { WarnUpMessageData } from "../typing";

const RouteEta = () => {
  const { id, panel } = useParams<{ id: string; panel: string }>();
  const {
    AppTitle,
    db: { routeList, stopList, stopMap },
    updateSelectedRoute,
    energyMode,
    workbox,
    geoPermission,
    geolocation,
  } = useContext(AppContext);
  const routeListEntry = routeList[id.toUpperCase()];
  const { route, stops, co, orig, dest, nlbId, fares, freq, jt } =
    routeListEntry;
  const stopsExtracted = useMemo(() => {
    return getStops(co, stops)
      .map((id) => {
        return stopList[id];
      })
      .filter((stop) => stop !== null && stop !== undefined);
  }, [co, stopList, stops]);
  let stopIdx = 0;
  if (panel !== undefined) {
    stopIdx = parseInt(panel, 10);
  } else if (geoPermission === "granted") {
    const nearbyStop = stopsExtracted
      .map((stop, idx) => [idx, getDistance(geolocation, stop.location)])
      .sort((a, b) => a[1] - b[1])[0];

    if (nearbyStop.length > 0) {
      stopIdx = nearbyStop[0];
    } else {
      stopIdx = 0;
    }
  } else {
    stopIdx = 0;
  }
  const [expanded, setExpanded] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOpenTimetable, setIsOpenTimetable] = useState(false);
  const dialogStop = useMemo(() => {
    return getDialogStops(co, stops, stopMap, String(stopIdx));
  }, [co, stopIdx, stopMap, stops]);

  const { t, i18n } = useTranslation();
  const history = useHistory();

  const handleChange = useCallback(
    (newStopIdx: number, expanded: boolean) => {
      if (expanded) {
        if (stopIdx !== newStopIdx) {
          history.replace(`/${i18n.language}/route/${id}/${newStopIdx}`);
        }
      }
      if (stopIdx === newStopIdx && !expanded) {
        setIsDialogOpen(true);
      } else {
        setExpanded(expanded);
      }
    },
    [history, i18n.language, id, stopIdx]
  );

  const onMarkerClick = useCallback(
    (newStopIdx: number) => {
      if (stopIdx === newStopIdx) {
        setIsDialogOpen(true);
      }
      history.replace(`/${i18n.language}/route/${id}/${newStopIdx}`);
    },
    [history, i18n.language, id, stopIdx]
  );

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  useEffect(() => {
    setIsDialogOpen(false);
    // the following is notify the rendering is done, for pre-rendering purpose
    document.getElementById(id).setAttribute("value", id);
    updateSelectedRoute(id);
  }, [id, updateSelectedRoute]);

  useEffect(() => {
    const pageDesc = () => {
      const uniqueFares = fares
        ? fares
            .filter((v, idx, self) => self.indexOf(v) === idx)
            .map((v) => `$${v}`)
        : [];
      if (i18n.language === "zh") {
        return (
          `路線${route}` +
          `由${orig.zh}出發，以${dest.zh}為終點，` +
          (uniqueFares.length ? `分段車費為${uniqueFares.join("、")}，` : "") +
          `途經${stopsExtracted.map((stop) => stop.name.zh).join("、")}。`
        );
      } else {
        return (
          `Route ${route} ` +
          `is from ${toProperCase(orig.en)} to ${toProperCase(dest.en)}` +
          (uniqueFares.length
            ? `, section fees are ${uniqueFares.join(", ")}. `
            : ". ") +
          "Stops: " +
          toProperCase(stopsExtracted.map((stop) => stop.name.en).join(", ")) +
          ". "
        );
      }
    };
    setSeoHeader({
      title:
        route +
        " " +
        t("往") +
        " " +
        toProperCase(dest[i18n.language]) +
        " - " +
        t(AppTitle),
      description: pageDesc(),
      lang: i18n.language,
    });
  }, [
    AppTitle,
    dest,
    fares,
    i18n.language,
    orig.en,
    orig.zh,
    route,
    stopsExtracted,
    t,
  ]);

  useEffect(() => {
    if (!energyMode) {
      const message: WarnUpMessageData = {
        type: "WARN_UP_MAP_CACHE",
        retinaDisplay: Leaflet.Browser.retina,
        zoomLevels: [14, 15, 16, 17, 18],
        stopList: getStops(co, stops)
          .map((id) => stopList[id])
          .filter((stop) => stop !== null && stop !== undefined),
      };
      workbox?.messageSW(message);
    }
  }, [co, energyMode, stopList, stops, workbox]);

  return (
    <>
      <input hidden id={id} />
      <Root id="route-eta-header" className={classes.header} elevation={0}>
        <RouteNo routeNo={route} component="h1" align="center" />
        <Typography component="h2" variant="caption" align="center">
          {t("往")} {toProperCase(dest[i18n.language])}{" "}
          {nlbId ? t("由") + " " + toProperCase(orig[i18n.language]) : ""}
        </Typography>
        {freq ? (
          <>
            <ButtonDivider
              orientation="vertical"
              className={classes.buttonDivider}
            />
            <TimeTableButton
              variant="text"
              aria-label="open-timetable"
              className={classes.timeTableButton}
              size="small"
              startIcon={<ScheduleIcon />}
              onClick={() => setIsOpenTimetable(true)}
            >
              {t("時間表")}
            </TimeTableButton>
            <TimetableDrawer
              freq={freq}
              jt={jt}
              open={isOpenTimetable}
              onClose={() => setIsOpenTimetable(false)}
            />
          </>
        ) : (
          <></>
        )}
      </Root>
      {!energyMode ? (
        <RouteMap
          stops={stopsExtracted}
          stopIdx={stopIdx}
          onMarkerClick={onMarkerClick}
        />
      ) : (
        <></>
      )}
      <StopAccordions
        routeId={id}
        stopIdx={stopIdx}
        routeListEntry={routeListEntry}
        stopListExtracted={stopsExtracted}
        expanded={expanded}
        handleChange={handleChange}
      />
      <StopDialog
        open={isDialogOpen}
        stops={dialogStop}
        handleClose={handleCloseDialog}
      />
    </>
  );
};

// TODO: better handling on buggy data in database
const getStops = (co: string[], stops: Record<string, string[]>): string[] => {
  for (let i = 0; i < co.length; ++i) {
    if (co[i] in stops) {
      return stops[co[i]];
    }
  }
  return [];
};

// TODO: better handling on buggy data in database
const getDialogStops = (co, stops, stopMap, panel) => {
  for (let i = 0; i < co.length; ++i) {
    if (co[i] in stops)
      return [[co[i], stops[co[i]][panel]]].concat(
        stopMap[stops[co[i]][panel]] || []
      );
  }
};

export default RouteEta;

const PREFIX = "route";

const classes = {
  header: `${PREFIX}-header`,
  buttonDivider: "timetable-button-divider",
  timeTableButton: "timetable-button",
};

const Root = styled(Paper)(({ theme }) => ({
  [`&.${classes.header}`]: {
    textAlign: "center",
    background: "transparent",
    position: "relative",
  },
}));

const ButtonDivider = styled(Divider)(({ theme }) => ({
  [`&.${classes.buttonDivider}`]: {
    position: "absolute",
    top: "0",
    right: "calc(64px + 2%)",
  },
}));

const TimeTableButton = styled(Button)(({ theme }) => ({
  [`&.${classes.timeTableButton}`]: {
    color: theme.palette.getContrastText(theme.palette.background.default),
    position: "absolute",
    top: "0",
    right: "2%",
    flexDirection: "column",
    justifyContent: "center",
    "& > .MuiButton-label": {
      flexDirection: "column",
      justifyContent: "center",
    },
    "& > .MuiButton-startIcon": {
      margin: 0,
    },
  },
}));
