import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import RouteHeader from "../components/route-eta/RouteHeader";
import StopAccordionList from "../components/route-eta/StopAccordionList";
import StopDialog from "../components/route-eta/StopDialog";
import AppContext from "../context/AppContext";
import { useTranslation } from "react-i18next";
import {
  setSeoHeader,
  toProperCase,
  getDistance,
  setSeoRouteFeature,
} from "../utils";
import StrSim from "string-similarity";
import {
  Company,
  RouteList,
  RouteListEntry,
  StopListEntry,
  StopMap,
} from "hk-bus-eta";
import useLanguage from "../hooks/useTranslation";
import DbContext from "../context/DbContext";
const RouteMap = React.lazy(() => import("../components/route-eta/RouteMap"));

const RouteEta = () => {
  const { id: _id, panel: _panel } = useParams();
  const id = _id as string;
  const panel = _panel as string | undefined;
  const {
    AppTitle,
    db: { routeList, stopList, stopMap },
  } = useContext(DbContext);
  const { updateSelectedRoute, energyMode, geoPermission, geolocation } =
    useContext(AppContext);
  const routeId = getRouteEntry(id.toUpperCase(), routeList);
  const routeListEntry = routeList[routeId];
  const { route, stops, co, orig, dest, fares } = routeListEntry;
  const stopIds = useMemo(() => {
    return getStops(co, stops)
      .map((id) => {
        return [id, stopList[id]] as [string, StopListEntry];
      })
      .filter(([, stop]) => stop !== null && stop !== undefined)
      .map(([id]) => id);
  }, [co, stopList, stops]);

  const [defaultStopIdx] = useState(() => {
    if (geoPermission === "granted") {
      const nearbyStop = stopIds
        .map((stopId, idx) => [
          idx,
          getDistance(geolocation.current, stopList[stopId].location),
        ])
        .sort((a, b) => a[1] - b[1])[0];

      if (nearbyStop.length > 0) {
        return nearbyStop[0];
      }
    }
    return 0;
  });

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
          let coStopsIdxes = stops[stopCo as Company].reduce(
            (acc, companyStop, i) => {
              if (companyStop === id) {
                acc.push(i);
              }
              return acc;
            },
            [] as number[]
          );
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
    return defaultStopIdx;
  }, [panel, stops, defaultStopIdx]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogStop = useMemo(
    () => getDialogStops(co, stops, stopMap, stopIdx),
    [co, stopIdx, stopMap, stops]
  );

  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();

  const handleChange = useCallback(
    (newStopIdx: number, expanded: boolean) => {
      if (expanded && stopIdx !== newStopIdx) {
        let newStopId =
          stops[Object.keys(stops).sort()[0] as Company][newStopIdx];
        navigate(`/${language}/route/${id}/${newStopId}%2C${newStopIdx}`, {
          replace: true,
        });
      }

      if (stopIdx === newStopIdx && !expanded) setIsDialogOpen(true);
    },
    [navigate, language, id, stopIdx, stops]
  );

  const onMarkerClick = useCallback(
    (newStopIdx: number) => {
      if (stopIdx === newStopIdx) {
        setIsDialogOpen(true);
      }
      navigate(`/${language}/route/${id}/${newStopIdx}`, {
        replace: true,
      });
    },
    [navigate, language, id, stopIdx]
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
    document.getElementById("render")?.setAttribute("value", "done");
    updateSelectedRoute(id);
    return () => {
      document.getElementById("render")?.setAttribute("value", "");
    };
  }, [id, updateSelectedRoute]);

  useEffect(() => {
    if (id.toUpperCase() !== routeId.toUpperCase()) {
      navigate(`/${language}/route/${routeId.toLowerCase()}`);
    }
  }, [id, routeId, language, navigate]);

  useEffect(() => {
    const pageDesc = () => {
      const uniqueFares = fares
        ? fares
            .filter((v, idx, self) => self.indexOf(v) === idx)
            .map((v) => `$${v}`)
        : [];
      if (language === "zh") {
        return (
          `路線${route}` +
          `由${orig.zh}出發，以${dest.zh}為終點，` +
          (uniqueFares.length ? `分段車費為${uniqueFares.join("、")}，` : "") +
          `途經${stopIds
            .map((stopId) => stopList[stopId].name.zh)
            .join("、")}。`
        );
      } else {
        return (
          `Route ${route} ` +
          `is from ${toProperCase(orig.en)} to ${toProperCase(dest.en)}` +
          (uniqueFares.length
            ? `, section fees are ${uniqueFares.join(", ")}. `
            : ". ") +
          "Stops: " +
          toProperCase(
            stopIds.map((stopId) => stopList[stopId].name.en).join(", ")
          ) +
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
        toProperCase(dest[language]) +
        " - " +
        t(AppTitle),
      description: pageDesc(),
      lang: language,
    });
    setSeoRouteFeature({
      route: routeListEntry,
      stopList,
      t,
      lang: language,
    });
  }, [
    AppTitle,
    dest,
    fares,
    language,
    orig.en,
    orig.zh,
    route,
    stopList,
    stopIds,
    t,
    routeListEntry,
  ]);

  return (
    <>
      <input hidden id="render" />
      <RouteHeader routeId={routeId} />
      {!energyMode && navigator.userAgent !== "prerendering" && (
        <Suspense fallback={null}>
          <RouteMap
            routeId={routeId}
            stopIds={stopIds}
            stopIdx={stopIdx}
            route={route}
            companies={co}
            onMarkerClick={onMarkerClick}
          />
        </Suspense>
      )}
      <StopAccordionList
        routeId={routeId}
        stopIdx={stopIdx}
        routeListEntry={routeListEntry}
        stopIds={stopIds}
        handleChange={handleChange}
        onStopInfo={handleStopInfo}
      />
      <StopDialog
        open={isDialogOpen}
        stops={dialogStop}
        onClose={handleCloseDialog}
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
const getDialogStops = (
  co: Company[],
  stops: RouteListEntry["stops"],
  stopMap: StopMap,
  idx: number
): Array<[Company, string]> => {
  for (let i = 0; i < co.length; ++i) {
    if (co[i] in stops)
      return [[co[i], stops[co[i]][idx]]].concat(
        stopMap[stops[co[i]][idx]] ?? []
      ) as Array<[Company, string]>;
  }
  return [];
};

export default RouteEta;
