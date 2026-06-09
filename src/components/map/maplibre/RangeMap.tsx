import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
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

  // Continuous: update local centre so the marker + circle visually
  // follow the map as the user drags. Fires every animation frame.
  const onMove = useCallback((e: ViewStateChangeEvent) => {
    const { longitude, latitude } = e.viewState;
    setCenter({ lat: latitude, lng: longitude });
  }, []);

  // One-shot: notify the parent only at the end of a gesture (drag
  // released, jumpTo settled, flyTo finished). Drops the parent
  // re-render rate from per-frame to per-gesture.
  const onMoveEnd = useCallback(
    (e: ViewStateChangeEvent) => {
      onChange({ lat: e.viewState.latitude, lng: e.viewState.longitude });
    },
    [onChange]
  );

  const onMapClick = useCallback((e: MapLayerMouseEvent) => {
    // jumpTo emits both `move` and `moveend`, so onMove/onMoveEnd
    // above handle the local state update + parent notification.
    e.target.jumpTo({ center: [e.lngLat.lng, e.lngLat.lat] });
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
      onMoveEnd={onMoveEnd}
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
      <RecenterButton geolocationRef={geolocation} />
    </BaseMap>
  );
};

export default RangeMap;

/**
 * "Recentre on my location" button. Lives inside `<BaseMap>` so it
 * can call `useImperativeMap` to fly the map itself — without this,
 * the click would only update React state and the map view would
 * stay put, leaving the marker stranded off-screen.
 *
 * `flyTo` emits `move` + `moveend`, so the outer `onMove`/`onMoveEnd`
 * handlers take care of the local state update + parent notification.
 */
const RecenterButton = ({
  geolocationRef,
}: {
  geolocationRef: MutableRefObject<Location>;
}) => {
  const m = useImperativeMap();
  return (
    <CenterControl
      onClick={() => {
        if (m.isReady()) m.flyTo(geolocationRef.current);
      }}
    />
  );
};

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
