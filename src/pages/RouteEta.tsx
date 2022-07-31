import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import RouteHeader from "../components/route-eta/RouteHeader";
import StopAccordions from "../components/route-eta/StopAccordions";
import StopDialog from "../components/route-eta/StopDialog";
import AppContext from "../AppContext";
import { useTranslation } from "react-i18next";
import { toProperCase, getDistance } from "../utils";
import type { WarnUpMessageData } from "../typing";
import type { RouteListEntry, Company, StopListEntry } from "hk-bus-eta";
import SeoHeader from "../SeoHeader";
const RouteMap = dynamic(() => import("../components/route-eta/RouteMap"), {
  ssr: false,
});
interface RouteEtaProps {
  routeId: string;
  routeListEntry: RouteListEntry;
  stopsExtracted: StopListEntry[];
  dialogStop: string[][];
  panel?: number;
  setPanel: (panel: number) => void;
}
const RouteEta = ({
  routeId: id,
  routeListEntry,
  stopsExtracted,
  dialogStop,
  panel,
  setPanel,
}: RouteEtaProps) => {
  const {
    AppTitle,
    db,
    updateSelectedRoute,
    energyMode,
    workbox,
    geoPermission,
    geolocation,
  } = useContext(AppContext);
  const { route, stops, co, orig, dest, fares } = routeListEntry;

  let stopIdx = 0;
  if (panel !== undefined) {
    stopIdx = panel;
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

  const { t, i18n } = useTranslation();
  const router = useRouter();

  const handleChange = useCallback(
    (newStopIdx: number, expanded: boolean) => {
      if (expanded && stopIdx !== newStopIdx) {
        setPanel(newStopIdx);
      }
      router.replace(`/${i18n.language}/route/${id}/#${newStopIdx}`);

      if (stopIdx === newStopIdx && !expanded) {
        setIsDialogOpen(true);
      } else {
        setExpanded(expanded);
      }
    },
    [stopIdx, router, i18n.language, id, setPanel]
  );

  const onMarkerClick = useCallback(
    (newStopIdx: number) => {
      if (stopIdx === newStopIdx) {
        setIsDialogOpen(true);
      } else {
        setPanel(newStopIdx);
      }
      router.replace(`/${i18n.language}/route/${id}/#${newStopIdx}`);
    },
    [stopIdx, router, i18n.language, id, setPanel]
  );

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  useEffect(() => {
    setIsDialogOpen(false);
    // the following is notify the rendering is done, for pre-rendering purpose
    document.getElementById(id).setAttribute("value", id);
    updateSelectedRoute(id);
  }, [id, updateSelectedRoute]);
  const pageDesc = useMemo(() => {
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
  }, [
    dest.en,
    dest.zh,
    fares,
    i18n.language,
    orig.en,
    orig.zh,
    route,
    stopsExtracted,
  ]);

  useEffect(() => {
    if (
      !energyMode &&
      typeof window !== "undefined" &&
      db.stopList !== undefined
    ) {
      const message: WarnUpMessageData = {
        type: "WARN_UP_MAP_CACHE",
        retinaDisplay:
          (window.devicePixelRatio ||
            // @ts-ignore: Property does not exist on type 'Screen'.
            window.screen.deviceXDPI / window.screen.logicalXDPI) > 1,
        zoomLevels: [14, 15, 16, 17, 18],
        stopList: getStops(co, stops)
          .map((id) => db.stopList[id])
          .filter((stop) => stop !== null && stop !== undefined),
      };
      workbox?.messageSW(message);
    }
  }, [co, energyMode, db.stopList, stops, workbox]);

  return (
    <>
      <SeoHeader
        title={`${route} ${t("往")} ${toProperCase(
          dest[i18n.language] ?? ""
        )} - ${t(AppTitle)}`}
        description={pageDesc}
      />
      <input hidden id={id} />
      <RouteHeader routeId={id} routeListEntry={routeListEntry} />
      {!energyMode && (
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
const getStops = (co: Company[], stops: RouteListEntry["stops"]): string[] => {
  for (let i = 0; i < co.length; ++i) {
    if (co[i] in stops) {
      return stops[co[i]];
    }
  }
  return [];
};

export default RouteEta;
