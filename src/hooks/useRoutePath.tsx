// @ts-nocheck
import { StopListEntry } from "hk-bus-eta";
import { useEffect, useState } from "react";

export const useRoutePath = (
  gtfsId: string,
  bound: "I" | "O" | "IO" | "OI",
  stops: StopListEntry[]
) => {
  const [geoJson, setGeoJson] = useState<GeoJSON.GeoJsonObject>(null);

  useEffect(() => {
    fetch(
      `https://hkbus.github.io/route-waypoints/${gtfsId}-${
        bound === "I" ? "I" : "O" // handling for pseudo circular route
      }.json`
    )
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
                coordinates: stops.reduce((acc, { location: { lat, lng } }) => {
                  acc.push([lng, lat]);
                  return acc;
                }, []),
              },
            },
          ],
          type: "FeatureCollection",
        });
      });
    return () => {
      setGeoJson(null);
    };
  }, [gtfsId, bound, stops]);

  return geoJson;
};
