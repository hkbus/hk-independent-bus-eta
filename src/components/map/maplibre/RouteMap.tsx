import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Marker, Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import { Box, type SxProps, type Theme } from "@mui/material";
import type { Company, StopListEntry } from "hk-bus-eta";
import type { Location as GeoLocation } from "hk-bus-eta";
import AppContext from "../../../context/AppContext";
import DbContext from "../../../context/DbContext";
import useLanguage from "../../../hooks/useTranslation";
import { useRoutePath } from "../../../hooks/useRoutePath";
import { checkPosition, getLineColor, locationEqual } from "../../../utils";
import BaseMap from "./BaseMap";
import SelfCircle from "./SelfCircle";
import MtrExits from "./MtrExits";
import CompassControl from "./CompassControl";
import CenterControl from "./CenterControl";
import { useImperativeMap } from "./useImperativeMap";

interface RouteMapProps {
  routeId: string;
  stopIds: string[];
  stopIdx: number;
  route: string;
  companies: Company[];
  onMarkerClick: (idx: number) => void;
}

interface RouteMapRef {
  initialCenter: GeoLocation;
  currentStopCenter: GeoLocation;
  /** Last centre requested via flyTo / setView. */
  center: GeoLocation;
  isFollow: boolean;
  stops: Array<StopListEntry>;
  stopIdx: number;
}

/**
 * Map view for the route ETA screen.
 *   • Initial centre = `stops[stopIdx].location`, zoom 16.
 *   • When `stops` change → `setView(_center)` (no animation).
 *   • When `stopIdx` changes (same stops) → `flyTo(_center)`.
 *   • Dragstart/dragend → stop following geolocation.
 *   • CenterControl click → flyTo my-location (or request permission).
 *   • Route path is drawn as a 6 px black border layer underneath a
 *     4 px coloured fill layer.
 *   • Jointly KMB+CTB lines fade between KMB red and CTB orange on a
 *     10 s cycle by toggling the line-color paint property in JS
 *     (MapLibre layers are canvas-rendered, so CSS keyframes don't
 *     apply directly).
 *   • Per-company marker icons (mtr / lightRail / gmb / lrtfeeder /
 *     nlb / jointly / ctb / kmb) use className-based background
 *     images defined in `rootSx`.
 */
const RouteMap = ({
  routeId,
  stopIds,
  stopIdx,
  route,
  companies,
  onMarkerClick,
}: RouteMapProps) => {
  const { geolocation, geoPermission, updateGeoPermission } =
    useContext(AppContext);
  const {
    db: { stopList },
  } = useContext(DbContext);
  const language = useLanguage();
  const stops = useMemo(
    () => stopIds.map((sid) => stopList[sid]),
    [stopList, stopIds]
  );
  const routePath = useRoutePath(routeId, stops);

  const mapRef = useRef<RouteMapRef>({
    initialCenter: stops[stopIdx] ? stops[stopIdx].location : checkPosition(),
    currentStopCenter: stops[stopIdx]
      ? stops[stopIdx].location
      : checkPosition(),
    center: stops[stopIdx] ? stops[stopIdx].location : checkPosition(),
    isFollow: false,
    stops,
    stopIdx,
  });

  // Track the actual centre we want to push to the map; a child
  // <MapEffects> below picks it up and calls flyTo/setView.
  const [pendingNav, setPendingNav] = useState<{
    type: "setView" | "flyTo";
    center: GeoLocation;
  } | null>(null);

  // Compute next centre whenever props change.
  useEffect(() => {
    let isFollow: boolean;
    let nextCenter: GeoLocation;

    if (mapRef.current.stops !== stops || mapRef.current.stopIdx !== stopIdx) {
      isFollow = false;
    } else {
      isFollow = mapRef.current.isFollow;
    }

    if (
      mapRef.current.stops === stops &&
      mapRef.current.stopIdx === stopIdx &&
      isFollow
    ) {
      nextCenter = geolocation.current;
    } else {
      nextCenter = stops[stopIdx] ? stops[stopIdx].location : checkPosition();
    }

    const prevCenter = mapRef.current.center;
    if (prevCenter !== nextCenter && !locationEqual(nextCenter, prevCenter)) {
      const type = mapRef.current.stops !== stops ? "setView" : "flyTo";
      setPendingNav({ type, center: nextCenter });
    }

    mapRef.current = {
      ...mapRef.current,
      center: nextCenter,
      currentStopCenter: stops[stopIdx]
        ? stops[stopIdx].location
        : checkPosition(),
      stops,
      stopIdx,
      isFollow,
    };
  }, [stops, stopIdx, geolocation]);

  const handleDragStartOrEnd = useCallback(() => {
    // Any user-initiated drag halts geolocation-follow mode.
    mapRef.current = {
      ...mapRef.current,
      center: mapRef.current.currentStopCenter,
      isFollow: false,
    };
  }, []);

  const onClickJumpToMyLocation = useCallback(() => {
    if (geoPermission === "granted") {
      setPendingNav({ type: "flyTo", center: geolocation.current });
      mapRef.current = {
        ...mapRef.current,
        center: geolocation.current,
        isFollow: true,
      };
    } else if (geoPermission !== "denied") {
      mapRef.current = { ...mapRef.current, isFollow: true };
      updateGeoPermission("opening");
    }
  }, [geolocation, geoPermission, updateGeoPermission]);

  const lineColor = getLineColor(companies, route);
  const isJointly = companies.includes("ctb") && companies.includes("kmb");

  // Flip the jointly-line colour every 5 s — paint properties on
  // <Layer> are reactive, so updating state re-applies the colour.
  const [jointlyColor, setJointlyColor] = useState<string>(() =>
    getLineColor(["kmb"], "")
  );
  useEffect(() => {
    if (!isJointly) return;
    const kmb = getLineColor(["kmb"], "");
    const ctb = getLineColor(["ctb"], "");
    setJointlyColor(kmb);
    const id = setInterval(() => {
      setJointlyColor((c) => (c === kmb ? ctb : kmb));
    }, 5000);
    return () => clearInterval(id);
  }, [isJointly]);

  return (
    <Box id="route-map" sx={rootSx}>
      <BaseMap
        initialViewState={{
          longitude: mapRef.current.initialCenter.lng,
          latitude: mapRef.current.initialCenter.lat,
          zoom: 16,
        }}
        // scrollZoom enabled so trackpad pinch works on macOS (pinch is
        // delivered as a wheel event with ctrlKey: true — disabling
        // scrollZoom would also disable trackpad pinch). For
        // wheel-scroll-only-on-ctrl behaviour, swap for
        // `cooperativeGestures` instead.
        onDragStart={handleDragStartOrEnd}
        onDragEnd={handleDragStartOrEnd}
        style={{ height: "35vh" }}
      >
        <MapEffects
          pending={pendingNav}
          onApplied={() => setPendingNav(null)}
        />

        <MtrExits />

        {/* Route path: black border layer first, colored fill on top. */}
        {routePath?.features?.length ? (
          // `useRoutePath` returns a loosely-typed GeoJsonType; in practice
          // it's a FeatureCollection of LineStrings, which Source accepts.
          <Source
            id="route-path"
            type="geojson"
            data={routePath as unknown as FeatureCollection}
          >
            <Layer
              id="route-path-border"
              type="line"
              paint={{
                "line-color": "#000000",
                "line-width": 6,
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
            <Layer
              id="route-path-fill"
              type="line"
              paint={{
                "line-color": isJointly ? jointlyColor : lineColor,
                "line-width": 4,
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </Source>
        ) : null}

        {/* Stop markers (rendered after the line layers so they sit on top). */}
        {stops.map((stop, idx) => {
          const m = stopMarkerInfo(companies, idx === stopIdx, idx < stopIdx);
          return (
            <Marker
              key={`${stop.location.lng}-${stop.location.lat}-${idx}`}
              longitude={stop.location.lng}
              latitude={stop.location.lat}
              anchor={m.anchor}
              offset={m.offset}
            >
              <div
                className={m.className}
                style={{
                  width: m.size,
                  height: m.size,
                  cursor: "pointer",
                  // Background image comes from the descendant CSS rules in
                  // the rootSx below (e.g. `.${classes.kmbMarker}`).
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
                aria-label={`${idx}. ${stop.name[language]}`}
                onClick={() => onMarkerClick(idx)}
              />
            </Marker>
          );
        })}

        <SelfCircle />
        <CenterControl onClick={onClickJumpToMyLocation} />
        <CompassControl />
      </BaseMap>
    </Box>
  );
};

export default RouteMap;

/**
 * Inner child that runs imperative flyTo / setView on the map when
 * the parent computes a new pending nav. Kept as a child so it has
 * access to react-map-gl's useMap context.
 */
const MapEffects = ({
  pending,
  onApplied,
}: {
  pending: { type: "setView" | "flyTo"; center: GeoLocation } | null;
  onApplied: () => void;
}) => {
  const m = useImperativeMap();
  // First-mount resize so the canvas matches the actual container size.
  useEffect(() => {
    if (m.isReady()) m.invalidateSize();
  }, [m]);

  useEffect(() => {
    if (!pending || !m.isReady()) return;
    if (pending.type === "setView") m.setView(pending.center);
    else m.flyTo(pending.center);
    onApplied();
  }, [pending, onApplied, m]);
  return null;
};

interface StopMarkerInfo {
  className: string;
  size: number;
  anchor: "center" | "bottom";
  offset?: [number, number];
}

const stopMarkerInfo = (
  companies: Company[],
  active: boolean,
  passed: boolean
): StopMarkerInfo => {
  const co = companies[0];
  const stateCls = `${classes.marker} ${active ? classes.active : ""} ${
    passed ? classes.passed : ""
  }`;
  if (co === "mtr" || companies.includes("lightRail")) {
    return {
      className: `${classes.mtrMarker} ${stateCls}`,
      size: 20,
      anchor: "center",
    };
  }
  if (co.startsWith("gmb")) {
    return {
      className: `${classes.gmbMarker} ${stateCls}`,
      size: 30,
      anchor: "bottom",
    };
  }
  if (companies.includes("lrtfeeder")) {
    return {
      className: `${classes.lrtfeederMarker} ${stateCls}`,
      size: 30,
      anchor: "bottom",
    };
  }
  if (companies.includes("nlb")) {
    return {
      className: `${classes.nlbMarker} ${stateCls}`,
      size: 30,
      anchor: "bottom",
    };
  }
  if (companies.includes("ctb") && companies.includes("kmb")) {
    return {
      className: `${classes.jointlyMarker} ${stateCls}`,
      size: 30,
      anchor: "bottom",
    };
  }
  if (companies.includes("ctb")) {
    return {
      className: `${classes.ctbMarker} ${stateCls}`,
      size: 30,
      anchor: "bottom",
    };
  }
  return {
    className: `${classes.kmbMarker} ${stateCls}`,
    size: 30,
    anchor: "bottom",
  };
};

const PREFIX = "map";

const classes = {
  mapContainerBox: `${PREFIX}-mapContainerBox`,
  mapContainer: `${PREFIX}-mapContainer`,
  centerControl: `${PREFIX}-centerControl`,
  marker: `${PREFIX}-marker`,
  mtrMarker: `${PREFIX}-mtrMarker`,
  gmbMarker: `${PREFIX}-gmbMarker`,
  ctbMarker: `${PREFIX}-ctbMarker`,
  jointlyMarker: `${PREFIX}-jointlyMarker`,
  lrtfeederMarker: `${PREFIX}-lrtfeederMarker`,
  nlbMarker: `${PREFIX}-nlbMarker`,
  kmbMarker: `${PREFIX}-kmbMarker`,
  jointlyLine: `${PREFIX}-jointlyLine`,
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
  [`& .${classes.mtrMarker}`]: {
    backgroundImage: `url(/img/mtr.svg)`,
  },
  [`& .${classes.gmbMarker}`]: {
    backgroundImage: `url(/img/minibus.svg)`,
  },
  [`& .${classes.ctbMarker}`]: {
    backgroundImage: `url(/img/bus_ctb.svg)`,
  },
  [`& .${classes.jointlyMarker}`]: {
    backgroundImage: `url(/img/bus_jointly.svg)`,
  },
  [`& .${classes.lrtfeederMarker}`]: {
    backgroundImage: `url(/img/bus_lrtfeeder.svg)`,
  },
  [`& .${classes.nlbMarker}`]: {
    backgroundImage: `url(/img/bus_nlb.svg)`,
  },
  [`& .${classes.kmbMarker}`]: {
    backgroundImage: `url(/img/bus_kmb.svg)`,
  },
  [`& .${classes.active}`]: {
    animation: "blinker 1.5s infinite",
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
  ["& .mtr-exit"]: {
    backgroundImage: `url(/img/HK_MTR_logo.svg)`,
  },
  ["& .mtr-exit-label"]: {
    background: "transparent",
    color: "#AC2E44",
    fontWeight: 600,
  },
  ["& .mtr-exit-barrier-free"]: {
    backgroundImage: `url(/img/Wheelchair_symbol.svg)`,
    backgroundSize: "12px 11px",
  },
};
