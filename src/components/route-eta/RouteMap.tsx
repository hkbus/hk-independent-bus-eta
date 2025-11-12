import { useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Box, SxProps, Theme } from "@mui/material";
import { type Company } from "hk-bus-eta";
import AppContext from "../../context/AppContext";
import type { StopListEntry } from "hk-bus-eta";
import { checkPosition, locationEqual } from "../../utils";
import type { Location as GeoLocation } from "hk-bus-eta";
import CompassControl from "../map/CompassControl";
import { useRoutePath } from "../../hooks/useRoutePath";
import { getLineColor } from "../../utils";
import DbContext from "../../context/DbContext";
import MtrExits from "../map/MtrExits";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import { createMapStyle } from "../../utils/mapStyle";

interface RouteMapProps {
  routeId: string;
  stopIds: string[];
  stopIdx: number;
  route: string;
  companies: Company[];
  onMarkerClick: (idx: number, event: MouseEvent) => void;
}

interface RouteMapRef {
  initialCenter: GeoLocation;
  map?: MapLibreMap;
  currentStopCenter: GeoLocation;
  center: GeoLocation;
  isFollow: boolean;
  stops: Array<StopListEntry>;
  stopIdx: number;
}

const RouteMap = ({
  routeId,
  stopIds,
  stopIdx,
  route,
  companies,
  onMarkerClick,
}: RouteMapProps) => {
  const { geolocation, colorMode } = useContext(AppContext);
  const {
    db: { stopList },
  } = useContext(DbContext);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Marker[]>([]);
  const stops = useMemo(
    () => stopIds.map((stopId) => stopList[stopId]),
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
    stops: stops,
    stopIdx: stopIdx,
  });
  const previousColorMode = useRef(colorMode);

  function darkenColor(hex: string, percent: number) {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    const num = parseInt(c, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    r = Math.max(0, Math.floor(r * (1 - percent)));
    g = Math.max(0, Math.floor(g * (1 - percent)));
    b = Math.max(0, Math.floor(b * (1 - percent)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = stops[stopIdx]
      ? stops[stopIdx].location
      : checkPosition();

    const newMap = new maplibregl.Map({
      container: mapContainerRef.current,
      style: createMapStyle(colorMode) as any,
      center: [initialCenter.lng, initialCenter.lat],
      zoom: 16,
      minZoom: 0,
      maxZoom: 22,
    });

    newMap.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
    newMap.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true,
      })
    );

    newMap.on("load", () => {
      setMap(newMap);
    });

    return () => {
      newMap.remove();
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center when stop changes or follow mode changes
  useEffect(() => {
    if (!map) return;

    let isFollow: boolean, _center: GeoLocation;
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
      _center = geolocation.current;
    } else {
      _center = stops[stopIdx] ? stops[stopIdx].location : checkPosition();
    }
    const center = mapRef.current.center;
    if (center !== _center && !locationEqual(_center, center)) {
      if (mapRef.current.stops !== stops) {
        map.setCenter([_center.lng, _center.lat]);
      } else {
        map.flyTo({ center: [_center.lng, _center.lat] });
      }
    }
    mapRef.current = {
      ...mapRef.current,
      center: _center,
      currentStopCenter: stops[stopIdx]
        ? stops[stopIdx].location
        : checkPosition(),
      stops: stops,
      stopIdx: stopIdx,
      isFollow: isFollow,
    };
  }, [stops, stopIdx, geolocation, map]);

  // Update map reference and drag handlers
  useEffect(() => {
    if (!map) return;

    mapRef.current = {
      ...mapRef.current,
      map: map,
    };

    const stopFollowingDeviceGeoLocation = () => {
      mapRef.current = {
        ...mapRef.current,
        center: mapRef.current.currentStopCenter,
        isFollow: false,
      };
    };

    map.on("dragend", stopFollowingDeviceGeoLocation);
    map.on("dragstart", stopFollowingDeviceGeoLocation);

    return () => {
      map.off("dragstart", stopFollowingDeviceGeoLocation);
      map.off("dragend", stopFollowingDeviceGeoLocation);
    };
  }, [map]);

  // Helper function to add route path layers to map
  const addRoutePathLayers = useCallback((
    map: MapLibreMap,
    routePath: any,
    companies: Company[],
    route: string,
    darkenColor: (hex: string, percent: number) => string
  ) => {
    if (!routePath?.features?.length) return;

    const sourceId = "route-path";
    const borderLayerId = "route-path-border";
    const lineLayerId = "route-path-line";

    // Remove existing layers and source
    if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
    if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    // Add new source
    map.addSource(sourceId, {
      type: "geojson",
      data: routePath as any,
    });

    // Calculate colors
    const lineColor = getLineColor(companies, route);
    const borderColor = darkenColor(lineColor, 0.4);

    // Add border layer
    map.addLayer({
      id: borderLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": borderColor,
        "line-width": 7,
      },
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
    });

    // Add line layer
    map.addLayer({
      id: lineLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": lineColor,
        "line-width": 4,
      },
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
    });
  }, []);

  // Helper function to add stop markers to map
  const addStopMarkers = useCallback((
    map: MapLibreMap,
    stops: Array<StopListEntry>,
    stopIdx: number,
    companies: Company[],
    onMarkerClick: (idx: number, event: MouseEvent) => void,
    markersRef: React.MutableRefObject<Marker[]>
  ) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    stops.forEach((stop, idx) => {
      const el = createStopMarkerElement({
        active: idx === stopIdx,
        passed: idx < stopIdx,
        companies,
      });

      const marker = new Marker({ element: el, anchor: "bottom" })
        .setLngLat([stop.location.lng, stop.location.lat])
        .addTo(map);

      el.addEventListener("click", (e) => {
        onMarkerClick(idx, e);
      });

      markersRef.current.push(marker);
    });
  }, []);

  // Add route path to map
  useEffect(() => {
    if (!map) return;

    addRoutePathLayers(map, routePath, companies, route, darkenColor);

    return () => {};
  }, [map, routePath, companies, route, addRoutePathLayers]);

  // Add stop markers to map
  useEffect(() => {
    if (!map) return;

    addStopMarkers(map, stops, stopIdx, companies, onMarkerClick, markersRef);

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, stops, stopIdx, companies, onMarkerClick, addStopMarkers]);

  useEffect(() => {
    if (!map) return;
    if (previousColorMode.current === colorMode) return;

    const style = createMapStyle(colorMode);
    previousColorMode.current = colorMode;

    map.setStyle(style as any);

    const onStyleData = () => {
      addRoutePathLayers(map, routePath, companies, route, darkenColor);
      addStopMarkers(map, stops, stopIdx, companies, onMarkerClick, markersRef);
    };
    map.once("styledata", onStyleData);
    return () => {
      map.off("styledata", onStyleData);
    };
  }, [
    colorMode,
    map,
    routePath,
    companies,
    route,
    stops,
    stopIdx,
    onMarkerClick,
    addRoutePathLayers,
    addStopMarkers,
  ]);

  return (
    <Box id="route-map" sx={rootSx}>
      <div ref={mapContainerRef} className={classes.mapContainer} />
      <MtrExits map={map} />
      <CompassControl />
    </Box>
  );
};

export default RouteMap;

interface StopMarkerProps {
  active: boolean;
  passed: boolean;
  companies: Company[];
}

const createStopMarkerElement = ({
  active,
  passed,
  companies,
}: StopMarkerProps): HTMLElement => {
  const el = document.createElement("div");
  el.style.width = "30px";
  el.style.height = "30px";
  el.style.cursor = "pointer";

  let className = classes.marker;
  let iconUrl = "/img/bus_kmb.svg";

  if (companies[0] === "mtr") {
    className += ` ${classes.mtrMarker}`;
    iconUrl = "/img/mtr.svg";
    el.style.width = "20px";
    el.style.height = "20px";
  } else if (companies.includes("lightRail")) {
    className += ` ${classes.mtrMarker}`;
    iconUrl = "/img/mtr.svg";
    el.style.width = "20px";
    el.style.height = "20px";
  } else if (companies[0].startsWith("gmb")) {
    className += ` ${classes.gmbMarker}`;
    iconUrl = "/img/minibus.svg";
  } else if (companies.includes("lrtfeeder")) {
    className += ` ${classes.lrtfeederMarker}`;
    iconUrl = "/img/bus_lrtfeeder.svg";
  } else if (companies.includes("nlb")) {
    className += ` ${classes.nlbMarker}`;
    iconUrl = "/img/bus_nlb.svg";
  } else if (companies.includes("ctb") && companies.includes("kmb")) {
    className += ` ${classes.jointlyMarker}`;
    iconUrl = "/img/bus_jointly.svg";
  } else if (companies.includes("ctb")) {
    className += ` ${classes.ctbMarker}`;
    iconUrl = "/img/bus_ctb.svg";
  } else {
    className += ` ${classes.kmbMarker}`;
    iconUrl = "/img/bus_kmb.svg";
  }

  if (active) className += ` ${classes.active}`;
  if (passed) className += ` ${classes.passed}`;

  el.className = className;
  el.style.backgroundImage = `url(${iconUrl})`;
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";
  el.style.backgroundPosition = "center";

  return el;
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

const rootSx: SxProps<Theme> = {
  height: "35vh",
  position: "relative",
  filter: (theme) =>
    theme.palette.mode === "dark" ? "brightness(0.8)" : "none",
  [`& .${classes.mapContainer}`]: {
    height: "35vh",
    width: "100%",
  },
  [`& .${classes.active}`]: {
    animation: "blinker 1.5s infinite",
  },
  [`& .${classes.passed}`]: {
    filter: "grayscale(100%)",
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
