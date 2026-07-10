import { StopListEntry } from "hk-bus-eta";
import { useContext, useEffect, useState } from "react";
import DbContext from "../context/DbContext";
import { getDistance } from "../utils";

interface GeoJsonType extends GeoJSON.GeoJsonObject {
  features?: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: Array<[number, number]>;
    };
  }>;
}

// Collapse a spurious "doubling-back" loop in the trailing CSDI waypoint part(s)
// to a straight chord (e.g. 6C draws an ~8km loop between two terminus stops 35m apart).
const dropSpuriousTail = (json: GeoJsonType): GeoJsonType => {
  const geometry = json?.features?.[0]?.geometry;
  if (geometry?.type !== "MultiLineString") return json;
  const parts = geometry.coordinates as unknown as [number, number][][];
  const dist = (a: [number, number], b: [number, number]) =>
    getDistance({ lat: a[1], lng: a[0] }, { lat: b[1], lng: b[0] });
  for (let i = parts.length - 1; i > 0; i--) {
    const part = parts[i];
    if (part.length < 2) break;
    let length = 0;
    let excursion = 0;
    for (let j = 1; j < part.length; j++) length += dist(part[j - 1], part[j]);
    for (const p of part) excursion = Math.max(excursion, dist(p, part[0]));
    const span = dist(part[0], part[part.length - 1]);
    if (length > 500 && excursion > 800 && excursion > 2 * Math.max(span, 30)) {
      parts[i] = [part[0], part[part.length - 1]];
    } else {
      break;
    }
  }
  return json;
};

export const useRoutePath = (routeId: string, stops: StopListEntry[]) => {
  const [geoJson, setGeoJson] = useState<GeoJsonType | null>(null);
  const {
    db: { routeList },
  } = useContext(DbContext);
  const { gtfsId, bound, co, route, dest } = routeList[routeId];

  useEffect(() => {
    let waypointsFile = "";
    if (gtfsId) {
      waypointsFile = `${gtfsId}-${
        bound[co[0]] === "I" ? "I" : "O" // handling for pseudo circular route
      }.json`;
    } else if (co.includes("mtr")) {
      waypointsFile = `${routeId.split("-")[0].toLowerCase()}.json`;
    } else if (route && co.includes("lightRail")) {
      // For light rail map
      waypointsFile = `${route}${dest.en.includes("Circular") ? "" : bound[co[0]] === "I" ? "_I" : "_O"}.json`;
    }
    const setFallbackGeoJson = () => {
      setGeoJson({
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: stops.reduce(
                (acc, { location: { lat, lng } }) => {
                  acc.push([lng, lat]);
                  return acc;
                },
                [] as [number, number][]
              ),
            },
          },
        ],
        type: "FeatureCollection",
      });
    };
    if (waypointsFile === "") {
      setFallbackGeoJson();
    } else {
      fetch(`https://hkbus.github.io/route-waypoints/${waypointsFile}`)
        .then((r) => r.json())
        .then((json) => {
          setGeoJson(dropSpuriousTail(json));
        })
        .catch(() => {
          setFallbackGeoJson();
        });
    }
    return () => {
      setGeoJson(null);
    };
  }, [routeId, gtfsId, bound, co, stops, dest, route]);

  return geoJson;
};
