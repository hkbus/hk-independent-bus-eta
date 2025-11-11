import { useContext, useEffect, useState, useRef } from "react";
import AppContext from "../../context/AppContext";
import { checkPosition } from "../../utils";
import { Map, Marker } from "maplibre-gl";
import useCompass, { OrientationState } from "react-world-compass";
import { Location } from "hk-bus-eta";

interface SelfCircleProps {
  map: Map | null;
}

const SelfCircle = ({ map }: SelfCircleProps) => {
  const { geolocation, geoPermission } = useContext(AppContext);
  const markerRef = useRef<Marker | null>(null);
  const [state, setState] = useState<Location>(
    checkPosition(geolocation.current)
  );

  const _compass = useCompass(100);
  const [compass, setCompass] = useState<OrientationState | null>(null);

  useEffect(() => {
    const elf = (nativeEvent: any) => {
      try {
        const data = JSON.parse(nativeEvent.data);
        if (data?.type === "compass") {
          setCompass({
            degree: data.degree,
            accuracy: data.accuracy,
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("message", elf);
    return () => {
      window.removeEventListener("message", elf);
    };
  }, []);

  useEffect(() => {
    setCompass(_compass);
  }, [_compass]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(checkPosition(geolocation.current));
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [geolocation]);

  useEffect(() => {
    if (!map || geoPermission !== "granted") {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    // Add circle layer if not exists
    if (!map.getSource("self-circle")) {
      map.addSource("self-circle", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [state.lng, state.lat],
          },
        },
      });

      map.addLayer({
        id: "self-circle-layer",
        type: "circle",
        source: "self-circle",
        paint: {
          "circle-radius": 25,
          "circle-color": "#3887be",
          "circle-opacity": 0.3,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#3887be",
        },
      });
    }

    // Create marker if not exists
    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "self-center";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.backgroundImage = "url(/img/self.svg)";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPosition = "center";
      el.style.transition = "transform 0.1s ease-out";
      el.style.transformOrigin = "center";

      markerRef.current = new Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([state.lng, state.lat])
        .addTo(map);
    }

    // Update position
    const source = map.getSource("self-circle") as any;
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [state.lng, state.lat],
        },
      });
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([state.lng, state.lat]);
      
      // Update rotation
      if (compass) {
        const el = markerRef.current.getElement();
        el.style.transform = `rotate(${360 - compass.degree}deg)`;
      }
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (map.getLayer("self-circle-layer")) {
        map.removeLayer("self-circle-layer");
      }
      if (map.getSource("self-circle")) {
        map.removeSource("self-circle");
      }
    };
  }, [map, state, geoPermission, compass]);

  return null;
};

export default SelfCircle;
