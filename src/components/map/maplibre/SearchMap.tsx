import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Marker,
  Source,
  Layer,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import type { Feature, FeatureCollection, LineString } from "geojson";
import { Box, type SxProps, type Theme } from "@mui/material";
import { Location as GeoLocation } from "hk-bus-eta";
import AppContext from "../../../context/AppContext";
import DbContext from "../../../context/DbContext";
import useLanguage from "../../../hooks/useTranslation";
import { checkPosition } from "../../../utils";
import { SearchRoute } from "../../../pages/RouteSearchPage";
import BaseMap from "./BaseMap";
import SelfCircle from "./SelfCircle";
import CompassControl from "./CompassControl";
import CenterControl from "./CenterControl";
import { useImperativeMap } from "./useImperativeMap";

/**
 * Map view for the route-search results screen.
 *
 * Renders, for each candidate route:
 *   • a colored line through the candidate's stops (one GeoJSON
 *     LineString per route since the segments form a contiguous path),
 *   • a clickable bus-stop marker at every stop, with active/passed
 *     state styling via the descendant CSS rules in `rootSx`,
 *   • start and end pin markers, plus dashed-green walking lines
 *     between every transit leg.
 *
 * Imperative flyTo / fitBounds is handled inside the `<MapEffects>`
 * child via `useImperativeMap`.
 */

interface MapEffectsProps {
  center: GeoLocation | null;
  start: GeoLocation;
  end: GeoLocation | null;
}

const MapEffects = ({ center, start, end }: MapEffectsProps) => {
  const m = useImperativeMap();
  useEffect(() => {
    if (!m.isReady()) return;
    if (center) {
      m.flyTo(center);
    } else if (end) {
      m.fitBounds([start, end], { padding: 40 });
    }
  }, [center, start, end, m]);
  return null;
};

const StartMarker = ({ start }: { start: GeoLocation }) => {
  if (!start) return null;
  return (
    <Marker
      longitude={start.lng}
      latitude={start.lat}
      anchor="bottom"
      offset={[0, 5]}
    >
      <img
        src={MARKER_ICON_URL}
        className={`${classes.marker} start`}
        style={{ width: 25, height: 41 }}
        alt=""
      />
    </Marker>
  );
};

const EndMarker = ({ end }: { end: GeoLocation | null }) => {
  if (!end) return null;
  return (
    <Marker
      longitude={end.lng}
      latitude={end.lat}
      anchor="bottom"
      offset={[0, 5]}
    >
      <img
        src={MARKER_ICON_URL}
        className={`${classes.marker} end`}
        style={{ width: 25, height: 41 }}
        alt=""
      />
    </Marker>
  );
};

interface BusRouteProps {
  route: SearchRoute;
  lv: number;
  stopIdx: number;
  onMarkerClick: (routeId: string, offset: number) => void;
}

const BusRoute = ({
  route: { routeId, on, off },
  lv,
  stopIdx,
  onMarkerClick,
}: BusRouteProps) => {
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);
  const language = useLanguage();

  const stops = useMemo(
    () =>
      Object.values(routeList[routeId].stops)
        .sort((a, b) => b.length - a.length)[0]
        .slice(on, off + 1),
    [routeList, routeId, on, off]
  );
  const routeNo = routeId.split("-")[0];

  // One contiguous LineString through every stop on this leg.
  const lineFeature = useMemo<Feature<LineString>>(
    () => ({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: stops.map((sid) => {
          const { lng, lat } = stopList[sid].location;
          return [lng, lat];
        }),
      },
    }),
    [stops, stopList]
  );

  const lineColor = lv === 0 ? "#FF9090" : "#d0b708";
  const sourceId = `bus-route-line-${routeId}-${lv}`;
  const layerId = `bus-route-line-layer-${routeId}-${lv}`;

  return (
    <>
      <Source id={sourceId} type="geojson" data={lineFeature}>
        <Layer
          id={layerId}
          type="line"
          paint={{
            "line-color": lineColor,
            "line-width": 3,
          }}
          layout={{ "line-cap": "round", "line-join": "round" }}
        />
      </Source>
      {stops.map((stopId, idx) => {
        const stop = stopList[stopId];
        const active = stopIdx === idx;
        const passed = idx < stopIdx;
        return (
          <Marker
            key={`${stopId}-${idx}`}
            longitude={stop.location.lng}
            latitude={stop.location.lat}
            anchor="bottom"
            offset={[0, 5]}
          >
            <img
              src={MARKER_ICON_URL}
              className={`${classes.marker} ${active ? classes.active : ""} ${
                passed ? classes.passed : ""
              } lv-${lv}`}
              style={{ width: 25, height: 41, cursor: "pointer" }}
              alt={`${idx}. ${routeNo} - ${stop.name[language]}`}
              onClick={() => onMarkerClick(routeId, idx)}
            />
          </Marker>
        );
      })}
    </>
  );
};

interface WalklinesProps {
  routes: SearchRoute[];
  start: GeoLocation | null;
  end: GeoLocation | null;
}

const Walklines = ({ routes, start, end }: WalklinesProps) => {
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);

  const data = useMemo<FeatureCollection | null>(() => {
    if (!(start && end)) return null;

    const points: GeoLocation[] = [start];
    (routes || []).forEach(({ routeId, on, off }) => {
      const stops = Object.values(routeList[routeId].stops).sort(
        (a, b) => b.length - a.length
      )[0];
      points.push(stopList[stops[on]].location);
      points.push(stopList[stops[off]].location);
    });
    points.push(end);

    const features: Feature<LineString>[] = [];
    // Every consecutive pair (start→firstOn, firstOff→secondOn, …,
    // lastOff→end) is one disconnected walking segment.
    for (let i = 0; i < points.length / 2; ++i) {
      const a = points[i * 2];
      const b = points[i * 2 + 1];
      if (!a || !b) continue;
      features.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [a.lng, a.lat],
            [b.lng, b.lat],
          ],
        },
      });
    }
    return { type: "FeatureCollection", features };
  }, [routes, start, end, routeList, stopList]);

  if (!data) return null;

  return (
    <Source id="walk-lines" type="geojson" data={data}>
      <Layer
        id="walk-lines-layer"
        type="line"
        paint={{
          "line-color": "green",
          "line-width": 3,
          "line-dasharray": [2, 2],
        }}
      />
    </Source>
  );
};

interface SearchMapProps {
  routes: SearchRoute[];
  start: GeoLocation;
  end: GeoLocation | null;
  stopIdx: number[] | null;
  onMarkerClick: (routeId: string, offset: number) => void;
}

const SearchMap = ({
  routes,
  start,
  end,
  stopIdx,
  onMarkerClick,
}: SearchMapProps) => {
  const { geolocation, geoPermission, updateGeoPermission } =
    useContext(AppContext);

  const [mapState, setMapState] = useState<{
    center: GeoLocation | null;
    isFollow: boolean;
  }>({ center: null, isFollow: false });
  const { center, isFollow } = mapState;

  // Initial centre is computed once — `initialViewState` on `<Map>`
  // is only consumed on the first render.
  const initialCenter = useMemo<GeoLocation>(() => {
    if (start && end)
      return {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2,
      };
    return checkPosition(start);
  }, [start, end]);

  const onDragEnd = useCallback((e: ViewStateChangeEvent) => {
    const c = e.target.getCenter();
    setMapState({ center: { lat: c.lat, lng: c.lng }, isFollow: false });
  }, []);

  // When isFollow is true, snap the centre to the device geolocation
  // whenever it changes (within the same render cycle).
  useEffect(() => {
    if (!isFollow) return;
    if (
      !center ||
      geolocation.current.lat !== center.lat ||
      geolocation.current.lng !== center.lng
    ) {
      setMapState({ center: geolocation.current, isFollow: true });
    }
  }, [geolocation, center, isFollow]);

  return (
    <Box sx={rootSx}>
      <BaseMap
        initialViewState={{
          longitude: initialCenter.lng,
          latitude: initialCenter.lat,
          zoom: 16,
        }}
        // scrollZoom enabled so trackpad pinch works on macOS (pinch is
        // delivered as a wheel event with ctrlKey: true — disabling
        // scrollZoom would also disable trackpad pinch). For
        // wheel-scroll-only-on-ctrl behaviour, swap for
        // `cooperativeGestures` instead.
        onDragEnd={onDragEnd}
        style={{ width: "100%", height: "100%" }}
      >
        <MapEffects center={center} start={checkPosition(start)} end={end} />
        {stopIdx !== null &&
          (routes || []).map((route, idx) => (
            <BusRoute
              key={`route-${idx}`}
              route={route}
              lv={idx}
              stopIdx={stopIdx[idx]}
              onMarkerClick={onMarkerClick}
            />
          ))}
        <Walklines routes={routes} start={start} end={end} />
        <SelfCircle />
        <StartMarker start={start} />
        <EndMarker end={end} />
        <CenterControl
          onClick={() => {
            if (geoPermission === "granted") {
              setMapState({ center: geolocation.current, isFollow: true });
            } else if (geoPermission !== "denied") {
              setMapState((prev) => ({ ...prev, isFollow: true }));
              updateGeoPermission("opening");
            }
          }}
        />
        <CompassControl />
      </BaseMap>
    </Box>
  );
};

export default SearchMap;

// Standard blue map pin. Worth moving into /public later to drop
// the external unpkg dependency.
const MARKER_ICON_URL =
  "https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png";

const PREFIX = "map";

const classes = {
  mapContainer: `${PREFIX}-mapContainer`,
  centralControl: `${PREFIX}-centralControl`,
  marker: `${PREFIX}-marker`,
  active: `${PREFIX}-active`,
  passed: `${PREFIX}-passed`,
};

// Descendant selectors below match marker DOM nodes because
// `<Marker>` mounts its children inside the map container, which is
// itself inside this Box.
const rootSx: SxProps<Theme> = {
  height: "35vh",
  filter: (theme) =>
    theme.palette.mode === "dark" ? "brightness(0.8)" : "none",
  // Two layers of explicit 35vh (on the Box and on the inner map
  // container) keeps the map sized correctly even under flex parents.
  "& .maplibregl-map": {
    height: "35vh",
  },
  [`& .${classes.marker}`]: {
    width: "40px",
    height: "40px",
    zIndex: 618,
    outline: "none",
    "&.lv-1": {
      filter: "hue-rotate(210deg) brightness(1.5)",
    },
    "&.start": {
      filter: "hue-rotate(30deg)",
    },
    "&.end": {
      filter: "hue-rotate(280deg)",
    },
  },
  [`& .${classes.active}`]: {
    animation: "blinker 2s cubic-bezier(0,1.5,1,1.5) infinite",
  },
  [`& .${classes.passed}`]: {
    filter: "grayscale(100%)",
  },
  [`& .self-center`]: {
    backgroundImage: "url(/img/self.svg)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    transition: "transform 0.1s ease-out",
    transformOrigin: "center",
  },
};
