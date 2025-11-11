import React, { useEffect, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import useLanguage from "../../hooks/useTranslation";
import Leaflet from "leaflet";

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

const MtrExits = () => {
  const [state, setState] = useState<MtrExitsState>(DEFAULT_STATE);
  const language = useLanguage();
  const map = useMap();
  useEffect(() => {
    fetch("https://data.hkbus.app/exits.mtr.json")
      .then((r) => r.json())
      .then((r) => {
        setState((prev) => ({
          ...prev,
          exits: r,
        }));
      });
    map.on("zoomend", function () {
      setState((prev) => ({
        ...prev,
        icon: map.getZoom() >= 17,
        label: map.getZoom() >= 18,
      }));
    });
  }, [map]);

  return (
    <>
      {state.exits.map((exit) => (
        <React.Fragment key={`${exit.name.en}-${exit.exit}`}>
          {!import.meta.env.VITE_IS_BASE_MAP_FROM_CSDI && state.icon && (
            <Marker
              position={exit}
              icon={Leaflet.divIcon({
                iconSize: [15, 12],
                iconAnchor: [7.5, 5],
                className: "mtr-exit",
              })}
              alt={exit.name[language]}
            />
          )}
          {!import.meta.env.VITE_IS_BASE_MAP_FROM_CSDI && state.label && (
            <Marker
              position={exit}
              icon={Leaflet.divIcon({
                html: exit.exit,
                iconAnchor: [-9, 7.5],
                className: "mtr-exit-label",
              })}
            />
          )}
          {state.label && exit.barrierFree && (
            <Marker
              position={exit}
              icon={Leaflet.divIcon({
                iconSize: [12, 11],
                iconAnchor: [-20, 5],
                className: "mtr-exit-barrier-free",
              })}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default MtrExits;

const DEFAULT_STATE: MtrExitsState = {
  exits: [],
  icon: false,
  label: false,
};
