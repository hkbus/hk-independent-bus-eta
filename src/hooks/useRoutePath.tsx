import { StopListEntry } from "hk-bus-eta";
import { useContext, useEffect, useState } from "react";
import DbContext from "../context/DbContext";

interface GeoJsonType extends GeoJSON.GeoJsonObject {
  features?: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: Array<[number, number]>;
    };
  }>;
}

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
    fetch(`https://hkbus.github.io/route-waypoints/${waypointsFile}`)
      .then((r) => r.json())
      .then((json) => {
        setGeoJson(json);
      })
      .catch(() => {
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
      });
    return () => {
      setGeoJson(null);
    };
  }, [routeId, gtfsId, bound, co, stops, dest, route]);

  return geoJson;
};
