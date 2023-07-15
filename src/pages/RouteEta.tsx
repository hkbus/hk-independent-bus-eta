import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import loadable from "@loadable/component";
import RouteHeader from "../components/route-eta/RouteHeader";
import StopAccordions from "../components/route-eta/StopAccordions";
import StopDialog from "../components/route-eta/StopDialog";
import AppContext from "../AppContext";
import { useTranslation } from "react-i18next";
import { setSeoHeader, toProperCase, getDistance } from "../utils";
import type { WarnUpMessageData } from "../typing";
const RouteMap = loadable(() => import("../components/route-eta/RouteMap"));

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
  const { route, stops, co, orig, dest, fares } = routeListEntry;
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
  const dialogStop = useMemo(() => {
    return getDialogStops(co, stops, stopMap, String(stopIdx));
  }, [co, stopIdx, stopMap, stops]);

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleChange = useCallback(
    (newStopIdx: number, expanded: boolean) => {
      if (expanded && stopIdx !== newStopIdx)
        navigate(`/${i18n.language}/route/${id}/${newStopIdx}`, {
          replace: true,
        });

      if (stopIdx === newStopIdx && !expanded) setIsDialogOpen(true);
      else setExpanded(expanded);
    },
    [navigate, i18n.language, id, stopIdx]
  );

  const onMarkerClick = useCallback(
    (newStopIdx: number) => {
      if (stopIdx === newStopIdx) {
        setIsDialogOpen(true);
      }
      navigate(`/${i18n.language}/route/${id}/${newStopIdx}`, {
        replace: true,
      });
    },
    [navigate, i18n.language, id, stopIdx]
  );

  const handleStopInfo = useCallback(() => {
    setIsDialogOpen(true);
  }, [setIsDialogOpen]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

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
    if (!energyMode && navigator.userAgent !== "prerendering") {
      const message: WarnUpMessageData = {
        type: "WARN_UP_MAP_CACHE",
        retinaDisplay:
          (window.devicePixelRatio ||
            // @ts-ignore: Property does not exist on type 'Screen'.
            window.screen.deviceXDPI / window.screen.logicalXDPI) > 1,
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
      <RouteHeader routeId={id.toUpperCase()} />
      {!energyMode && navigator.userAgent !== "prerendering" && (
        <RouteMap
          stops={stopsExtracted}
          stopIdx={stopIdx}
          onMarkerClick={onMarkerClick}
        />
      )}
      <StopAccordions
        routeId={id}
        stopIdx={stopIdx}
        routeListEntry={routeListEntry}
        stopListExtracted={stopsExtracted}
        expanded={expanded && navigator.userAgent !== "prerendering"}
        handleChange={handleChange}
        onStopInfo={handleStopInfo}
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
