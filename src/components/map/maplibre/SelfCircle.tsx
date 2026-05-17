import { useContext, useEffect, useMemo, useState } from "react";
import { Marker, Source, Layer } from "react-map-gl/maplibre";
import useCompass, { type OrientationState } from "react-world-compass";
import type { Location } from "hk-bus-eta";
import type { Feature, Polygon } from "geojson";
import AppContext from "../../../context/AppContext";
import { checkPosition } from "../../../utils";
import { buildGeodesicCirclePolygon } from "./geom";

/**
 * Two visual elements at the user's location:
 *   1. A 25 m accuracy circle (filled, semi-transparent). Generated
 *      as a geodesic GeoJSON polygon so it stays meter-accurate
 *      across zoom levels — MapLibre's native `circle` layer is
 *      pixel-based, which would shrink visually as you zoom out.
 *   2. A heading arrow that rotates to match the device's compass.
 *
 * Requires `.self-center` to be defined in an ancestor (used as the
 * heading arrow icon, 20×20).
 */
const SelfCircle = () => {
  const { geolocation, geoPermission } = useContext(AppContext);
  const [state, setState] = useState<Location>(
    checkPosition(geolocation.current)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setState(checkPosition(geolocation.current));
    }, 100);
    return () => clearInterval(interval);
  }, [geolocation]);

  // Compass: prefer the browser-driven hook, fall back to the
  // native bridge postMessage payload that the mobile webview sends.
  const browserCompass = useCompass(100);
  const [compass, setCompass] = useState<OrientationState | null>(null);

  useEffect(() => {
    const handler = (nativeEvent: MessageEvent) => {
      try {
        const data = JSON.parse(nativeEvent.data);
        if (data?.type === "compass") {
          setCompass({ degree: data.degree, accuracy: data.accuracy });
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    setCompass(browserCompass);
  }, [browserCompass]);

  const accuracyCircle = useMemo<Feature<Polygon> | null>(() => {
    if (!state) return null;
    return buildGeodesicCirclePolygon(state.lng, state.lat, 25);
  }, [state]);

  if (geoPermission !== "granted" || !state) return null;

  return (
    <>
      {accuracyCircle && (
        <Source id="self-accuracy" type="geojson" data={accuracyCircle}>
          <Layer
            id="self-accuracy-fill"
            type="fill"
            paint={{
              "fill-color": "#3388ff",
              "fill-opacity": 0.2,
            }}
          />
          <Layer
            id="self-accuracy-outline"
            type="line"
            paint={{
              "line-color": "#3388ff",
              "line-width": 1,
            }}
          />
        </Source>
      )}
      {compass && (
        <Marker
          longitude={state.lng}
          latitude={state.lat}
          anchor="center"
          rotation={360 - compass.degree}
          rotationAlignment="viewport"
        >
          <div className="self-center" style={{ width: 20, height: 20 }} />
        </Marker>
      )}
    </>
  );
};

export default SelfCircle;
