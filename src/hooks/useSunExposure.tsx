import { useEffect, useMemo, useState } from "react";
import type { Location as GeoLocation } from "hk-bus-eta";
import { getRouteSunExposure, type RouteSunExposure } from "../sun";

/** How often the sun's position is re-evaluated. */
const REFRESH_MS = 5 * 60 * 1000;

/**
 * Where the sun currently falls along a route, refreshed every few
 * minutes. `null` while the sun is below the horizon.
 */
export const useSunExposure = (
  locations: GeoLocation[]
): RouteSunExposure | null => {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return useMemo(
    () => getRouteSunExposure(locations, new Date(now)),
    [locations, now]
  );
};

export default useSunExposure;
