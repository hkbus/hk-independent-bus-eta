import { useEffect, useState, useRef } from "react";
import { Map, Marker } from "maplibre-gl";

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

interface MtrExitsProps {
  map: Map | null;
}



const MtrExits = ({ map }: MtrExitsProps) => {
  const [exits, setExits] = useState<MtrExit[]>([]);
  const markersRef = useRef<Record<string, Marker>>({});
  const [_, setZoom] = useState<number>(14);

  useEffect(() => {
    fetch("https://data.hkbus.app/exits.mtr.json")
      .then((r) => r.json())
      .then((exits) => setExits(exits));
  }, []);

  useEffect(() => {
    if (!map) return;
    if (!exits.length) return;

    const updateMarkers = () => {
      const bounds = map.getBounds();
      const currentZoom = map.getZoom();
      setZoom(currentZoom);

      Object.keys(markersRef.current).forEach((exitId) => {
        if (!exits.find((e) => e.exit === exitId)) {
          markersRef.current[exitId].remove();
          delete markersRef.current[exitId];
        }
      });

      exits.forEach((exit) => {
        if (!markersRef.current[exit.exit]) {
          const el = document.createElement("div");
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.pointerEvents = "auto";

          const markerSpan = document.createElement("img");
          markerSpan.src = "/img/HK_MTR_logo.svg";
          markerSpan.alt = "MTR Exit";
          markerSpan.style.width = "15px";
          markerSpan.style.height = "15px";
          markerSpan.style.display = "block";
          el.appendChild(markerSpan);

          el.title = exit.name.en + (exit.barrierFree ? " (Barrier-free)" : "");

          const marker = new Marker({ element: el, anchor: "bottom" })
            .setLngLat([exit.lng, exit.lat]);
          markersRef.current[exit.exit] = marker;
        }

        const marker = markersRef.current[exit.exit];
        marker.setLngLat([exit.lng, exit.lat]);

        if (currentZoom >= 16 && bounds.contains({ lng: exit.lng, lat: exit.lat })) {
          if (!marker.getElement().parentNode) {
            marker.addTo(map);
          }
        } else {
          marker.remove();
        }
      });
    };

    updateMarkers();
    map.on("move", updateMarkers);
    map.on("zoom", updateMarkers);
    return () => {
      map.off("move", updateMarkers);
      map.off("zoom", updateMarkers);
      Object.values(markersRef.current).forEach((marker) => marker.remove());
    };
  }, [map, exits]);

  return null;
};

export default MtrExits;
