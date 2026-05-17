import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Marker,
  Source,
  Layer,
  type MapLayerMouseEvent,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import type { Location } from "hk-bus-eta";
import type { Feature, Polygon } from "geojson";
import AppContext from "../../../context/AppContext";
import BaseMap from "./BaseMap";
import CenterControl from "./CenterControl";
import { useImperativeMap } from "./useImperativeMap";
import { buildGeodesicCirclePolygon } from "./geom";

interface RangeMapProps {
  range: number;
  value: Location;
  onChange: (location: Location) => void;
}

/**
 * Range-picker map.
 *   • Initial centre = `value` (captured once on mount).
 *   • Marker + accuracy circle track the map centre as the user drags.
 *   • Click on the basemap → re-centre on the clicked point + onChange.
 *   • CenterControl → re-centre on device geolocation.
 *   • When `range` changes, fit bounds to the new circle (no animation).
 *
 * The accuracy circle is a geodesic GeoJSON polygon so it stays
 * meter-accurate across zoom levels (MapLibre's native `circle` layer
 * is pixel-based, which would shrink visually as you zoom out).
 */
const RangeMap = ({ range, value, onChange }: RangeMapProps) => {
  const { geolocation } = useContext(AppContext);
  // Captured once — `initialViewState` is only consumed on first render.
  const initial = useRef<Location>(value).current;
  const [center, setCenter] = useState<Location>(initial);

  // Notify parent of every centre update.
  useEffect(() => {
    onChange(center);
    // Intentionally omit onChange from deps — we don't want to
    // re-fire when the handler identity changes between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]);

  const onMove = useCallback((e: ViewStateChangeEvent) => {
    const { longitude, latitude } = e.viewState;
    setCenter({ lat: latitude, lng: longitude });
  }, []);

  const onMapClick = useCallback((e: MapLayerMouseEvent) => {
    const next: Location = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    // Jump (no animation) to the clicked point.
    e.target.jumpTo({ center: [next.lng, next.lat] });
    setCenter(next);
  }, []);

  const circleFeature = useMemo<Feature<Polygon>>(
    () => buildGeodesicCirclePolygon(center.lng, center.lat, range),
    [center, range]
  );

  return (
    <BaseMap
      initialViewState={{
        longitude: initial.lng,
        latitude: initial.lat,
        zoom: 14,
      }}
      onMove={onMove}
      onClick={onMapClick}
      style={{ height: "100%", position: "relative" }}
    >
      <FitToRange center={center} range={range} />
      <Source id="range-circle" type="geojson" data={circleFeature}>
        <Layer
          id="range-circle-fill"
          type="fill"
          paint={{
            "fill-color": "#3388ff",
            "fill-opacity": 0.2,
          }}
        />
        <Layer
          id="range-circle-outline"
          type="line"
          paint={{
            "line-color": "#3388ff",
            "line-width": 2,
          }}
        />
      </Source>
      <Marker longitude={center.lng} latitude={center.lat} anchor="bottom">
        <img
          src={DEFAULT_MARKER_ICON_URL}
          style={{ width: 25, height: 41, pointerEvents: "none" }}
          alt=""
        />
      </Marker>
      <CenterControl
        onClick={() => {
          const c = geolocation.current;
          setCenter(c);
        }}
      />
    </BaseMap>
  );
};

export default RangeMap;

/**
 * Inner child: when `range` (or center) changes, compute the circle's
 * bounding box and fit the map to it without animation. Animating
 * fitBounds in quick succession produces glitchy behaviour, hence
 * `animate: false`.
 */
const FitToRange = ({ center, range }: { center: Location; range: number }) => {
  const m = useImperativeMap();
  useEffect(() => {
    if (!m.isReady()) return;
    // Build a square bbox around the center that's slightly larger
    // than the circle radius, in meters, then convert to lat/lng.
    const earthRadius = 6_378_137;
    const dLat = (range / earthRadius) * (180 / Math.PI);
    const dLng =
      (range / (earthRadius * Math.cos((center.lat * Math.PI) / 180))) *
      (180 / Math.PI);
    m.fitBounds(
      [
        { lat: center.lat - dLat, lng: center.lng - dLng },
        { lat: center.lat + dLat, lng: center.lng + dLng },
      ],
      { animate: false, padding: 40 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, m]); // intentionally don't refit on every centre nudge
  return null;
};

// Standard blue map pin. Worth moving into /public later to drop
// the external unpkg dependency.
const DEFAULT_MARKER_ICON_URL =
  "https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png";
