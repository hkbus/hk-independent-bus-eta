import { useContext, useEffect, useState } from "react";
import AppContext from "../AppContext";

export const useRoutePath = (
  gtfsId: string,
  bound: "I" | "O" | "IO" | "OI"
) => {
  const [geoJson, setGeoJson] = useState<GeoJSON.GeoJsonObject>(null);
  const { lowDataMode } = useContext(AppContext);

  useEffect(() => {
    if (lowDataMode) return;
    fetch(
      `https://hkbus.github.io/hk-bus-crawling/waypoints/${gtfsId}-${
        bound === "O" ? "1" : "2"
      }.json`
    ).then((response) => {
      if (response.ok) {
        return response.json().then((json) => {
          // @ts-ignore
          setGeoJson(json);
        });
      }
    });
  }, [lowDataMode, gtfsId, bound]);

  return geoJson;
};
