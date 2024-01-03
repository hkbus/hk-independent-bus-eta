// @ts-nocheck
import { StopListEntry } from "hk-bus-eta";
import { useContext, useEffect, useState } from "react";
import AppContext from "../AppContext";

export const useRoutePath = (routeId: string, stops: StopListEntry[]) => {
  const [geoJson, setGeoJson] = useState<GeoJSON.GeoJsonObject>(null);
  const {
    db: { routeList },
  } = useContext(AppContext);
  const { gtfsId, bound, co } = routeList[routeId];

  useEffect(() => {
    let waypointsFile = "";
    if (gtfsId) {
      waypointsFile = `${gtfsId}-${
        bound[co[0]] === "I" ? "I" : "O" // handling for pseudo circular route
      }.json`;
    } else if (co.includes("mtr")) {
      waypointsFile = `${routeId.split("-")[0].toLowerCase()}.json`;
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
  }, [routeId, gtfsId, bound, co, stops]);

  return geoJson;
};
