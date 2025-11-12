import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { Box, SxProps, Theme } from "@mui/material";
import AppContext from "../../context/AppContext";
import { checkPosition, getLineColor } from "../../utils";
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
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

const SearchMap = ({
  routes,
  start,
  end,
  stopIdx,
  onMarkerClick,
  onMapClick,
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
  const startEndMarkersRef = useRef<Marker[]>([]);
  const sourceLayerIdsRef = useRef<Set<string>>(new Set());

  const normalizeLng = (lng: number): number => {
    while (lng > 180) lng -= 360;
    while (lng < -180) lng += 360;
    return lng;
  };

  const normalizeCoordinates = (coords: GeoLocation[]): GeoLocation[] => {
    if (coords.length === 0) return coords;

    return coords.map((coord, i) => {
      if (i === 0) return { ...coord, lng: normalizeLng(coord.lng) };

      let lng = coord.lng;
      const prevLng = coords[i - 1].lng;

      lng = normalizeLng(lng);

      while (lng - prevLng > 180) lng -= 360;
      while (lng - prevLng < -180) lng += 360;

      return { lat: coord.lat, lng };
    });
  };

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
      const normalizedCoords = normalizeCoordinates([start, end]);
      return {
        lat: (normalizedCoords[0].lat + normalizedCoords[1].lat) / 2,
        lng: (normalizedCoords[0].lng + normalizedCoords[1].lng) / 2,
      };
    }
    return checkPosition(start);
  };

  const removeAllSourcesAndLayers = useCallback(() => {
    if (!map) return;

    sourceLayerIdsRef.current.forEach((id) => {
      const layerId = `${id}-layer`;
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    });
    sourceLayerIdsRef.current.clear();
  }, [map]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = getMapCenter();

    const newMap = new maplibregl.Map({
      container: mapContainerRef.current,
      style: createMapStyle(colorMode) as any,
      center: [normalizeLng(initialCenter.lng), initialCenter.lat],
      zoom: 15,
      pitch: 0,
      maxPitch: 0,
      minZoom: 0,
      maxZoom: 22,
      renderWorldCopies: false,
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

      if (onMapClick) {
        newMap.on("click", (e) => {
          onMapClick({
            lng: e.lngLat.lng,
            lat: e.lngLat.lat,
          });
        });
      }
    });

    return () => {
      newMap.remove();
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (!map || !start) return;

    if (end) {
      const normalizedCoords = normalizeCoordinates([start, end]);
      const bounds = new maplibregl.LngLatBounds();

      normalizedCoords.forEach((coord) => {
        bounds.extend([coord.lng, coord.lat]);
      });

      map.fitBounds(bounds, {
        padding: 80,
        duration: 1000,
        maxZoom: 16,
      });
    } else {
      const normalizedStart = normalizeCoordinates([start])[0];
      map.flyTo({
        center: [normalizedStart.lng, normalizedStart.lat],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [map, start, end]);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    removeAllSourcesAndLayers();

    if (stopIdx === null || !Array.isArray(routes) || routes.length === 0) {
      return;
    }

    const allPoints: GeoLocation[] = [start];

    routes.forEach(({ routeId, on, off }) => {
      const route = routeList[routeId];
      const stopsCollections =
        route && route.stops ? Object.values(route.stops) : [];
      const longestStops = stopsCollections.length
        ? (stopsCollections as any[]).sort((a, b) => b.length - a.length)[0]
        : [];
      const stops = Array.isArray(longestStops)
        ? longestStops.slice(on, off + 1)
        : [];

      stops.forEach((stopId) => {
        if (stopList[stopId]) {
          allPoints.push(stopList[stopId].location);
        }
      });
    });

    if (end) allPoints.push(end);

    const normalizedPoints = normalizeCoordinates(allPoints);
    let pointIndex = 0;

    const walkPoints: GeoLocation[] = [];
    walkPoints.push(normalizedPoints[pointIndex++]); // start

    routes.forEach(({ routeId, on, off }) => {
      const route = routeList[routeId];
      const stopsCollections =
        route && route.stops ? Object.values(route.stops) : [];
      const longestStops = stopsCollections.length
        ? (stopsCollections as any[]).sort((a, b) => b.length - a.length)[0]
        : [];
      const stops = Array.isArray(longestStops)
        ? longestStops.slice(on, off + 1)
        : [];

      if (stops.length > 0) {
        walkPoints.push(normalizedPoints[pointIndex]); // first stop of route
        pointIndex += stops.length - 1;
        walkPoints.push(normalizedPoints[pointIndex]); // last stop of route
        pointIndex++;
      }
    });

    walkPoints.push(
      end ? normalizedPoints[normalizedPoints.length - 1] : normalizedPoints[0]
    );

    for (let i = 0; i < Math.floor(walkPoints.length / 2); ++i) {
      const walkSourceId = `walk-${i}`;
      const walkCoordinates = [
        [walkPoints[i * 2].lng, walkPoints[i * 2].lat],
        [walkPoints[i * 2 + 1].lng, walkPoints[i * 2 + 1].lat],
      ];

      map.addSource(walkSourceId, {
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
        id: `${walkSourceId}-layer`,
        type: "line",
        source: walkSourceId,
        paint: {
          "line-color": "#4CAF50",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });

      sourceLayerIdsRef.current.add(walkSourceId);
    }

    pointIndex = 1; // skip start pt

    routes.forEach(({ routeId, on, off }, idx) => {
      const route = routeList[routeId];
      const stopsCollections =
        route && route.stops ? Object.values(route.stops) : [];
      const longestStops = stopsCollections.length
        ? (stopsCollections as any[]).sort((a, b) => b.length - a.length)[0]
        : [];
      const stops = Array.isArray(longestStops)
        ? longestStops.slice(on, off + 1)
        : [];

      if (stops.length === 0) return;

      const routeNormalizedCoords = normalizedPoints.slice(
        pointIndex,
        pointIndex + stops.length
      );
      pointIndex += stops.length;

      const isMtrRoute = route && route.co && route.co.includes("mtr");
      const routeNumber = routeId.split("-")[0];
      const lineColor = isMtrRoute
        ? getLineColor(route.co, routeNumber)
        : idx === 0
          ? "#2196F3"
          : "#FF9800";

      const lineSourceId = `route-${idx}-line`;
      const lineCoordinates = routeNormalizedCoords.map((coord) => [
        coord.lng,
        coord.lat,
      ]);

      map.addSource(lineSourceId, {
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
        id: `${lineSourceId}-layer`,
        type: "line",
        source: lineSourceId,
        paint: {
          "line-color": lineColor,
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });

      sourceLayerIdsRef.current.add(lineSourceId);

      routeNormalizedCoords.forEach((coord, stopIndex) => {
        const isPassed = stopIndex < stopIdx[idx];

        const markerColor = isPassed ? "#9E9E9E" : lineColor;

        const el = document.createElement("div");
        el.className = `${classes.marker} ${isPassed ? classes.passed : ""}`;
        el.style.backgroundColor = markerColor;
        el.style.width = "10px";
        el.style.height = "10px";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        el.style.cursor = "pointer";
        el.style.zIndex = "100";

        const marker = new Marker({ element: el, anchor: "center" })
          .setLngLat([coord.lng, coord.lat])
          .addTo(map);

        el.addEventListener("click", () => {
          onMarkerClick(routeId, stopIndex);
        });

        markersRef.current.push(marker);
      });
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      removeAllSourcesAndLayers();
    };
  }, [
    map,
    routes,
    stopIdx,
    routeList,
    stopList,
    onMarkerClick,
    start,
    end,
    removeAllSourcesAndLayers,
  ]);

  useEffect(() => {
    if (!map) return;

    startEndMarkersRef.current.forEach((marker) => marker.remove());
    startEndMarkersRef.current = [];

    const normalizedCoords = normalizeCoordinates(end ? [start, end] : [start]);

    const startMarker = new Marker({
      color: "#4CAF50",
      scale: 1.2,
    })
      .setLngLat([normalizedCoords[0].lng, normalizedCoords[0].lat])
      .addTo(map);

    startEndMarkersRef.current.push(startMarker);

    let endMarker: Marker | null = null;
    if (end && normalizedCoords.length > 1) {
      endMarker = new Marker({
        color: "#F44336",
        scale: 1.2,
      })
        .setLngLat([normalizedCoords[1].lng, normalizedCoords[1].lat])
        .addTo(map);

      startEndMarkersRef.current.push(endMarker);
    }

    return () => {
      startEndMarkersRef.current.forEach((marker) => marker.remove());
      startEndMarkersRef.current = [];
    };
  }, [map, start, end]);

  return (
    <Box sx={rootSx}>
      <div ref={mapContainerRef} className={classes.mapContainer} />
    </Box>
  );
};

export default SearchMap;

const PREFIX = "map";

const classes = {
  mapContainer: `${PREFIX}-mapContainer`,
  centralControl: `${PREFIX}-centralControl`,
  marker: `${PREFIX}-marker`,
  passed: `${PREFIX}-passed`,
};

const rootSx: SxProps<Theme> = {
  height: "35vh",
  position: "relative",
  filter: (theme) =>
    theme.palette.mode === "dark" ? "brightness(0.85)" : "none",
  [`& .${classes.mapContainer}`]: {
    height: "35vh",
    width: "100%",
    borderRadius: 1,
    overflow: "hidden",
  },
  [`& .${classes.marker}`]: {
    outline: "none",
    "&:hover": {
      transform: "scale(1.5)",
    },
  },
  [`& .${classes.passed}`]: {
    opacity: 0.5,
  },
};
