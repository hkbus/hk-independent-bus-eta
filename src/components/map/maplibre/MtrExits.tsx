import { Fragment, useEffect, useState } from "react";
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

interface MtrExitsState {
  exits: MtrExit[];
  icon: boolean;
  label: boolean;
}

const DEFAULT_STATE: MtrExitsState = {
  exits: [],
  icon: false,
  label: false,
};

/**
 * MTR exit markers fetched from https://data.hkbus.app/exits.mtr.json.
 *   • Icon visible at zoom >= 17.
 *   • Text label + barrier-free icon visible at zoom >= 18.
 *   • Suppressed entirely by VITE_IS_BASE_MAP_FROM_CSDI for the icon
 *     and label layers (where the basemap already shows them).
 *
 * Visibility is seeded from `map.getZoom()` on mount so that maps
 * which first render already zoomed past 17 show the icons immediately.
 */
const MtrExits = () => {
  const [state, setState] = useState<MtrExitsState>(DEFAULT_STATE);
  const language = useLanguage();
  const maps = useMap();
  const map = maps.current?.getMap();

  // One-shot fetch of the exits dataset.
  useEffect(() => {
    let cancelled = false;
    fetch("https://data.hkbus.app/exits.mtr.json")
      .then((r) => r.json())
      .then((r) => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, exits: r }));
      })
      .catch((e) => console.error("MtrExits fetch failed:", e));
    return () => {
      cancelled = true;
    };
  }, []);

  // Zoom-driven visibility toggles.
  useEffect(() => {
    if (!map) return;
    const update = () => {
      const z = map.getZoom();
      setState((prev) => ({ ...prev, icon: z >= 17, label: z >= 18 }));
    };
    update(); // seed once mounted
    map.on("zoomend", update);
    return () => {
      map.off("zoomend", update);
    };
  }, [map]);

  const hideOnCsdi = !!import.meta.env.VITE_IS_BASE_MAP_FROM_CSDI;

  return (
    <>
      {state.exits.map((exit) => (
        <Fragment key={`${exit.name.en}-${exit.exit}`}>
          {!hideOnCsdi && state.icon && (
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
          {!hideOnCsdi && state.label && (
            <Marker
              longitude={exit.lng}
              latitude={exit.lat}
              anchor="top-left"
              offset={[9, -7.5]}
            >
              <div className="mtr-exit-label">{exit.exit}</div>
            </Marker>
          )}
          {state.label && exit.barrierFree && (
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
