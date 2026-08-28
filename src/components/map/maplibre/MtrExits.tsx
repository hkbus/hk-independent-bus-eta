import { Fragment, useEffect, useMemo, useState } from "react";
import { Marker, useMap } from "react-map-gl/maplibre";
import useLanguage from "../../../hooks/useTranslation";

interface MtrExit {
  name: {
    en: string;
    zh: string;
  };
  exit: string;
  lat: number;
  lng: number;
  barrierFree: boolean;
}

interface Viewport {
  west: number;
  south: number;
  east: number;
  north: number;
  zoom: number;
}

/**
 * MTR exit markers fetched from https://data.hkbus.app/exits.mtr.json.
 *   • Icon visible at zoom >= 17.
 *   • Text label + barrier-free icon visible at zoom >= 18.
 *   • Suppressed entirely by VITE_IS_BASE_MAP_FROM_CSDI for the icon
 *     and label layers (where the basemap already shows them).
 *
 * Perf notes:
 *   • The exits dataset covers all of HK (~500 exits × up to 3 markers
 *     each ≈ 1500 potential Markers). At high zoom every maplibre
 *     `<Marker>` attaches a `move` listener that recomputes its CSS
 *     transform per frame — 1500 of them stalls the main thread while
 *     panning. We viewport-cull to the exits inside the current map
 *     bounds (typically 10–30) before rendering.
 *   • Viewport is refreshed on `moveend`, not every frame, so the
 *     filter cost is user-driven.
 */
const MtrExits = () => {
  const [exits, setExits] = useState<MtrExit[]>([]);
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const language = useLanguage();
  const maps = useMap();
  const map = maps.current?.getMap();

  useEffect(() => {
    let cancelled = false;
    fetch("https://data.hkbus.app/exits.mtr.json")
      .then((r) => r.json())
      .then((r) => {
        if (cancelled) return;
        setExits(r);
      })
      .catch((e) => console.error("MtrExits fetch failed:", e));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    const update = () => {
      const b = map.getBounds();
      setViewport({
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth(),
        zoom: map.getZoom(),
      });
    };
    update(); // seed on mount
    map.on("moveend", update);
    return () => {
      map.off("moveend", update);
    };
  }, [map]);

  const hideOnCsdi = !!import.meta.env.VITE_IS_BASE_MAP_FROM_CSDI;

  // Skip everything under zoom 17 — nothing renders anyway.
  const showIcon = !!viewport && viewport.zoom >= 15;
  const showLabel = !!viewport && viewport.zoom >= 18;

  const visible = useMemo(() => {
    if (!viewport || (!showIcon && !showLabel)) return [];
    // Small pad in degrees so markers that peek in from the edge of
    // the viewport don't pop as the user starts to pan.
    const pad = 0.001; // ~110 m at HK latitudes
    return exits.filter(
      (e) =>
        e.lng >= viewport.west - pad &&
        e.lng <= viewport.east + pad &&
        e.lat >= viewport.south - pad &&
        e.lat <= viewport.north + pad
    );
  }, [exits, viewport, showIcon, showLabel]);

  return (
    <>
      {visible.map((exit) => (
        <Fragment key={`${exit.name.en}-${exit.exit}`}>
          {!hideOnCsdi && showIcon && (
            <Marker
              longitude={exit.lng}
              latitude={exit.lat}
              anchor="top-left"
              offset={[-7.5, -5]}
            >
              <div
                className="mtr-exit"
                style={{ width: 15, height: 12 }}
                aria-label={exit.name[language]}
              />
            </Marker>
          )}
          {!hideOnCsdi && showLabel && (
            <Marker
              longitude={exit.lng}
              latitude={exit.lat}
              anchor="top-left"
              offset={[9, -7.5]}
            >
              <div className="mtr-exit-label">{exit.exit}</div>
            </Marker>
          )}
          {showLabel && exit.barrierFree && (
            <Marker
              longitude={exit.lng}
              latitude={exit.lat}
              anchor="top-left"
              offset={[20, -5]}
            >
              <div
                className="mtr-exit-barrier-free"
                style={{ width: 12, height: 11 }}
              />
            </Marker>
          )}
        </Fragment>
      ))}
    </>
  );
};

export default MtrExits;
