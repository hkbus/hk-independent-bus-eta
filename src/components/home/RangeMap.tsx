import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import AppContext from "../../context/AppContext";
import { Location } from "hk-bus-eta";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import { createMapStyle } from "../../utils/mapStyle";

import type { Feature, Polygon } from "geojson";

function createGeoJSONCircle(
  center: { lat: number; lng: number },
  radiusInMeters: number,
  points = 64
): Feature<Polygon> {
  const coords: [number, number][] = [];
  const earthRadius = 6378137;
  const lat = (center.lat * Math.PI) / 180;
  for (let i = 0; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const dx = radiusInMeters * Math.cos(angle);
    const dy = radiusInMeters * Math.sin(angle);
    const latOffset = dy / earthRadius;
    const lngOffset = dx / (earthRadius * Math.cos(lat));
    coords.push([
      center.lng + (lngOffset * 180) / Math.PI,
      center.lat + (latOffset * 180) / Math.PI,
    ]);
  }
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
  };
}

interface RangeMapProps {
  range: number;
  value: Location;
  onChange: (location: Location) => void;
}

const RangeMap = React.forwardRef<MapLibreMap, RangeMapProps>(
  ({ range, value, onChange }, ref) => {
    const markerRef = useRef<Marker | null>(null);
    const position = useRef<Location>(value).current;
    const { colorMode } = useContext(AppContext);
    const [map, setMap] = useState<MapLibreMap | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => map as MapLibreMap, [map]);

    const handleMove = useCallback(() => {
      if (map === null) return;
      const center = map.getCenter();
      const newLocation = { lat: center.lat, lng: center.lng };

      if (markerRef.current) {
        markerRef.current.setLngLat([center.lng, center.lat]);
      }

      // Update circle as polygon
      const source = map.getSource("range-circle") as any;
      if (source) {
        source.setData(createGeoJSONCircle(center, range));
      }

      onChange(newLocation);
    }, [onChange, map, range]);

    // Initialize map
    useEffect(() => {
      if (!mapContainerRef.current) return;

      const newMap = new maplibregl.Map({
        container: mapContainerRef.current,
        style: createMapStyle(colorMode) as any,
        center: [position.lng, position.lat],
        zoom: 14,
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
        // Add circle source and layer (as polygon)
        newMap.addSource("range-circle", {
          type: "geojson",
          data: createGeoJSONCircle(position, range),
        });

        newMap.addLayer({
          id: "range-circle-layer",
          type: "fill",
          source: "range-circle",
          paint: {
            "fill-color": "#3887be",
            "fill-opacity": 0.3,
            "fill-outline-color": "#3887be",
          },
        });

        setMap(newMap);
      });

      return () => {
        newMap.remove();
        setMap(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Add marker
    useEffect(() => {
      if (!map) return;

      const el = document.createElement("div");
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.backgroundImage =
        "url(https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png)";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";

      markerRef.current = new Marker({ element: el, anchor: "bottom" })
        .setLngLat([position.lng, position.lat])
        .addTo(map);

      return () => {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
      };
    }, [map, position.lng, position.lat]);

    // Handle map movement
    useEffect(() => {
      if (!map) return;
      map.on("move", handleMove);
      return () => {
        map.off("move", handleMove);
      };
    }, [handleMove, map]);

    useEffect(() => {
      if (!map) return;
      const source = map.getSource("range-circle") as any;
      const center = map.getCenter();
      if (source) {
        source.setData(
          createGeoJSONCircle({ lat: center.lat, lng: center.lng }, range)
        );
      }
      const bounds = new maplibregl.LngLatBounds();
      const circle = createGeoJSONCircle(
        { lat: center.lat, lng: center.lng },
        range
      );
      circle.geometry.coordinates[0].forEach(([lng, lat]) =>
        bounds.extend([lng, lat])
      );
      map.fitBounds(bounds, { padding: 50, animate: false });
    }, [map, range]);

    useEffect(() => {
      if (!map) return;

      const handleClick = (e: any) => {
        const center = { lat: e.lngLat.lat, lng: e.lngLat.lng };
        map.setCenter([center.lng, center.lat]);
        onChange(center);
      };

      map.on("click", handleClick);
      return () => {
        map.off("click", handleClick);
      };
    }, [map, onChange]);

    return (
      <div style={{ height: "100%", position: "relative" }}>
        <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      </div>
    );
  }
);

export default RangeMap;
