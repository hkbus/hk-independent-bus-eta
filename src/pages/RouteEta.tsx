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
import StrSim from "string-similarity";
import { RouteList } from "hk-bus-eta";
const RouteMap = loadable(() => import("../components/route-eta/RouteMap"));

const RouteEta = () => {
  const { id, panel } = useParams<{ id: string; panel?: string }>();
  const {
    AppTitle,
    db: { routeList, stopList, stopMap },
    updateSelectedRoute,
    energyMode,
    workbox,
    geoPermission,
    geolocation,
  } = useContext(AppContext);
  const routeId = getRouteEntry(id.toUpperCase(), routeList);
  const routeListEntry = routeList[routeId];
  const { route, stops, co, orig, dest, fares } = routeListEntry;
  const stopsExtracted = useMemo(() => {
    return getStops(co, stops)
      .map((id) => {
        return stopList[id];
      })
      .filter((stop) => stop !== null && stop !== undefined);
  }, [co, stopList, stops]);

  const stopIdx = useMemo(() => {
    if (panel !== undefined) {
      const [id, indexStr] = panel.split(",");
      if (id === undefined || indexStr === undefined) {
        return parseInt(panel, 10);
      } else {
        const index = parseInt(indexStr, 10);
        let ret = 0;
        let currentDistance = 9999999;
        for (let stopCo in stops) {
          let coStopsIdxes = stops[stopCo].reduce((ind, el, i) => {
            if (el === id) {
              ind.push(i);
            }
            return ind;
          }, []);
          for (let coStopsIdx of coStopsIdxes) {
            if (coStopsIdx >= 0) {
              let distanceToId = Math.abs(coStopsIdx - index);
              if (distanceToId < currentDistance) {
                ret = coStopsIdx;
                currentDistance = distanceToId;
              }
            }
          }
        }
        return ret;
      }
    }
    if (geoPermission === "granted") {
      const nearbyStop = stopsExtracted
        .map((stop, idx) => [idx, getDistance(geolocation, stop.location)])
        .sort((a, b) => a[1] - b[1])[0];

      if (nearbyStop.length > 0) {
        return nearbyStop[0];
      }
    }
    return 0;
  }, [panel, geoPermission, stopsExtracted, geolocation, stops]);

  const [expanded, setExpanded] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogStop = useMemo(() => {
    return getDialogStops(co, stops, stopMap, String(stopIdx));
  }, [co, stopIdx, stopMap, stops]);

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleChange = useCallback(
    (newStopIdx: number, expanded: boolean) => {
      if (expanded && stopIdx !== newStopIdx) {
        let newStopId = stops[Object.keys(stops).sort()[0]][newStopIdx];
        navigate(`/${i18n.language}/route/${id}/${newStopId}%2C${newStopIdx}`, {
          replace: true,
        });
      }

      if (stopIdx === newStopIdx && !expanded) setIsDialogOpen(true);
      else setExpanded(expanded);
    },
    [navigate, i18n.language, id, stopIdx, stops]
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
    if (id.toUpperCase() !== routeId.toUpperCase()) {
      console.log(id, routeId);
      navigate(`/${i18n.language}/route/${routeId.toLowerCase()}`);
    }
  }, [id, routeId, i18n.language, navigate]);

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
      <RouteHeader routeId={routeId} />
      {!energyMode && navigator.userAgent !== "prerendering" && (
        <RouteMap
          routeId={routeId}
          stops={stopsExtracted}
          stopIdx={stopIdx}
          companies={co}
          onMarkerClick={onMarkerClick}
        />
      )}
      <StopAccordions
        routeId={routeId}
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

const getRouteEntry = (id: string, routeList: RouteList) => {
  if (routeList[id] !== undefined) return id;
  const prefix = id.split("-")[0];
  return StrSim.findBestMatch(
    id.toUpperCase(),
    Object.keys(routeList).filter((v) => v.startsWith(prefix))
  ).bestMatch.target;
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
