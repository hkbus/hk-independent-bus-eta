import { useEffect, useState } from "react";

export const useRoutePath = (
  gtfsId: string,
  bound: "I" | "O" | "IO" | "OI"
) => {
  const [geoJson, setGeoJson] = useState<GeoJSON.GeoJsonObject>(null);

  useEffect(() => {
    fetch(
      `https://hkbus.github.io/route-waypoints/${gtfsId}-${bound}.json`
    ).then((response) => {
      if (response.ok) {
        return response.json().then((json) => {
          // @ts-ignore
          setGeoJson(json);
        });
      }
    });
  }, [gtfsId, bound]);

  return geoJson;
};
