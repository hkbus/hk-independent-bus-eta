import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { Box, SxProps, Theme } from "@mui/material";
import AppContext from "../../context/AppContext";
import { checkPosition } from "../../utils";
import { Location as GeoLocation } from "hk-bus-eta";
import { SearchRoute } from "../../pages/RouteSearch";
import DbContext from "../../context/DbContext";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import { createMapStyle } from "../../utils/mapStyle";

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
  const { geolocation, colorMode } = useContext(AppContext);
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);
  const [mapState, setMapState] = useState<{
    center: GeoLocation | null;
    isFollow: boolean;
  }>({
    center: null,
    isFollow: false,
  });
  const { center, isFollow } = mapState;
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Marker[]>([]);

  const updateCenter = useCallback(
    (state?: { center?: GeoLocation; isFollow?: boolean }) => {
      const { center, isFollow } = state ?? {};
      setMapState({
        center: center || map?.getCenter() || null,
        isFollow: isFollow || false,
      });
    },
    [map, setMapState]
  );

  const getMapCenter = () => {
    if (center) return center;

    if (start && end) {
      return {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2,
      };
    }
    return checkPosition(start);
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = getMapCenter();

    const newMap = new maplibregl.Map({
      container: mapContainerRef.current,
      style: createMapStyle(colorMode) as any,
      center: [initialCenter.lng, initialCenter.lat],
      zoom: 16,
      pitch: 0,
      maxPitch: 0,
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

  // Handle drag events
  useEffect(() => {
    if (!map) return;

    const dragCallback = () => {
      const center = map.getCenter();
      updateCenter({
        center: { lat: center.lat, lng: center.lng },
      });
    };

    map.on("dragend", dragCallback);
    return () => {
      map.off("dragend", dragCallback);
    };
  }, [map, updateCenter]);

  // Handle follow mode
  useEffect(() => {
    if (isFollow) {
      if (
        !center ||
        geolocation.current.lat !== center.lat ||
        geolocation.current.lng !== center.lng
      )
        updateCenter({ center: geolocation.current, isFollow: true });
    }
  }, [geolocation, center, isFollow, updateCenter]);

  // Update map center/bounds when start/end changes
  useEffect(() => {
    if (!map || !center) return;

    if (end) {
      const bounds = new maplibregl.LngLatBounds(
        [start.lng, start.lat],
        [end.lng, end.lat]
      );
      map.fitBounds(bounds, { padding: 50 });
    } else {
      map.flyTo({ center: [center.lng, center.lat] });
    }
  }, [map, center, start, end]);

  // Render route lines and markers
  useEffect(() => {
    // Guard: routes may be undefined during initial render; bail out early
    if (
      !map ||
      stopIdx === null ||
      !Array.isArray(routes) ||
      routes.length === 0
    )
      return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Remove existing route sources and layers
    for (let idx = 0; idx < routes.length; idx++) {
      const lineSourceId = `route-${idx}-line`;
      const walkSourceId = `route-${idx}-walk`;
      if (map.getLayer(`${lineSourceId}-layer`))
        map.removeLayer(`${lineSourceId}-layer`);
      if (map.getSource(lineSourceId)) map.removeSource(lineSourceId);
      if (map.getLayer(`${walkSourceId}-layer`))
        map.removeLayer(`${walkSourceId}-layer`);
      if (map.getSource(walkSourceId)) map.removeSource(walkSourceId);
    }

    // Add route lines
    routes.forEach(({ routeId, on, off }, idx) => {
      // routeList or its stops may be missing — make access resilient
      const route = routeList[routeId];
      const stopsCollections =
        route && route.stops ? Object.values(route.stops) : [];
      const longestStops = stopsCollections.length
        ? (stopsCollections as any[]).sort((a, b) => b.length - a.length)[0]
        : [];
      const stops = Array.isArray(longestStops)
        ? longestStops.slice(on, off + 1)
        : [];

      // Add stop markers
      stops.forEach((stopId, stopIndex) => {
        const el = createBusStopMarkerElement({
          active: stopIdx[idx] === stopIndex,
          passed: stopIndex < stopIdx[idx],
          lv: idx,
        });

        const marker = new Marker({ element: el, anchor: "bottom" })
          .setLngLat([
            stopList[stopId].location.lng,
            stopList[stopId].location.lat,
          ])
          .addTo(map);

        el.addEventListener("click", () => {
          onMarkerClick(routeId, stopIndex);
        });

        markersRef.current.push(marker);
      });

      // Add route line
      const lineCoordinates = stops.map((stopId) => [
        stopList[stopId].location.lng,
        stopList[stopId].location.lat,
      ]);

      map.addSource(`route-${idx}-line`, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: lineCoordinates,
          },
        },
      });

      map.addLayer({
        id: `route-${idx}-line-layer`,
        type: "line",
        source: `route-${idx}-line`,
        paint: {
          "line-color": idx === 0 ? "#FF9090" : "#d0b708",
          "line-width": 3,
        },
      });
    });

    // Add walk lines
    const points = [];
    points.push(start);
    routes.forEach(({ routeId, on, off }) => {
      const route = routeList[routeId];
      const stopsCollections =
        route && route.stops ? Object.values(route.stops) : [];
      const longestStops = stopsCollections.length
        ? (stopsCollections as any[]).sort((a, b) => b.length - a.length)[0]
        : [];
      const startStopId = longestStops && longestStops[on];
      const endStopId = longestStops && longestStops[off];
      if (startStopId && stopList[startStopId])
        points.push(stopList[startStopId].location);
      if (endStopId && stopList[endStopId])
        points.push(stopList[endStopId].location);
    });
    points.push(end || start);

    for (let i = 0; i < points.length / 2; ++i) {
      const walkCoordinates = [
        [points[i * 2].lng, points[i * 2].lat],
        [points[i * 2 + 1].lng, points[i * 2 + 1].lat],
      ];

      map.addSource(`walk-${i}`, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: walkCoordinates,
          },
        },
      });

      map.addLayer({
        id: `walk-${i}-layer`,
        type: "line",
        source: `walk-${i}`,
        paint: {
          "line-color": "green",
          "line-width": 2,
        },
      });
    }

    return () => {};
  }, [map, routes, stopIdx, routeList, stopList, onMarkerClick, start, end]);

  // Add start and end markers
  useEffect(() => {
    if (!map) return;

    const startMarker = new Marker({
      element: createEndsMarkerElement(true),
      anchor: "bottom",
    })
      .setLngLat([start.lng, start.lat])
      .addTo(map);

    let endMarker: Marker | null = null;
    if (end) {
      endMarker = new Marker({
        element: createEndsMarkerElement(false),
        anchor: "bottom",
      })
        .setLngLat([end.lng, end.lat])
        .addTo(map);
    }

    return () => {
      startMarker.remove();
      if (endMarker) endMarker.remove();
    };
  }, [map, start, end]);

  return (
    <Box sx={rootSx}>
      <div ref={mapContainerRef} className={classes.mapContainer} />
    </Box>
  );
};

export default SearchMap;

interface BusStopMarkerProps {
  active: boolean;
  passed: boolean;
  lv: number;
}

const createBusStopMarkerElement = ({
  active,
  passed,
  lv,
}: BusStopMarkerProps): HTMLElement => {
  const el = document.createElement("div");
  el.style.width = "24px";
  el.style.height = "40px";
  el.style.cursor = "pointer";
  el.style.backgroundImage =
    "url(https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png)";
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";

  let className = classes.marker;
  if (active) className += ` ${classes.active}`;
  if (passed) className += ` ${classes.passed}`;
  className += ` lv-${lv}`;

  el.className = className;

  return el;
};

const createEndsMarkerElement = (isStart: boolean): HTMLElement => {
  const el = document.createElement("div");
  el.style.width = "24px";
  el.style.height = "40px";
  el.style.cursor = "pointer";
  el.style.backgroundImage =
    "url(https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png)";
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";

  el.className = `${classes.marker} ${isStart ? "start" : "end"}`;

  return el;
};

const PREFIX = "map";

const classes = {
  mapContainer: `${PREFIX}-mapContainer`,
  centralControl: `${PREFIX}-centralControl`,
  marker: `${PREFIX}-marker`,
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
};
