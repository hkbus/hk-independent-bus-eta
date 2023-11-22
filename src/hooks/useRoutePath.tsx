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
      "https://api.csdi.gov.hk/apim/dataquery/api/?" +
        new URLSearchParams({
          id: "td_rcd_1638844988873_41214",
          layer: "fb_route_line",
          limit: "10",
          offset: "0",
          ROUTE_ID: gtfsId,
          ROUTE_SEQ: bound === "O" ? "1" : "2",
        })
    ).then((response) => {
      if (response.ok) {
        return response.json().then((json) => {
          setGeoJson(json);
        });
      }
    });
  }, [lowDataMode, gtfsId, bound]);

  return geoJson;
};
