import { useEffect, useMemo, useState } from "react";
import type { Location as GeoLocation } from "hk-bus-eta";
import {
  getRouteSunExposure,
  getSunPosition,
  type RouteSunExposure,
  type SunPosition,
} from "../sun";

/** How often the sun's position is re-evaluated. */
const REFRESH_MS = 5 * 60 * 1000;

/** Ticks every few minutes so the sun is allowed to move. */
const useSunClock = (enabled: boolean): number => {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, [enabled]);
  return now;
};

/**
 * Where the sun is over a single point, or `null` once it has set.
 * Hong Kong is small enough that any point on a route will do.
 */
export const useSunPosition = (
  location: GeoLocation | undefined
): SunPosition | null => {
  const now = useSunClock(location !== undefined);
  return useMemo(() => {
    if (!location) return null;
    const position = getSunPosition(new Date(now), location);
    return position.altitude > 0 ? position : null;
  }, [location, now]);
};

/**
 * Where the sun currently falls along a route, refreshed every few
 * minutes. `null` while the sun is below the horizon, or whenever
 * `enabled` is false — switched off it starts no timer and does no
 * arithmetic, so a rider who never turns it on pays nothing for it.
 */
export const useSunExposure = (
  locations: GeoLocation[],
  enabled = true
): RouteSunExposure | null => {
  const now = useSunClock(enabled);
  return useMemo(
    () => (enabled ? getRouteSunExposure(locations, new Date(now)) : null),
    [enabled, locations, now]
  );
};

export default useSunExposure;
