import { useEffect, useMemo, useState } from "react";
import type { Location as GeoLocation } from "hk-bus-eta";
import {
  getNextSunrise,
  getRouteSunExposure,
  getSunPosition,
  type RouteSunExposure,
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
 * When the sun next rises, or `null` while it is already up. Used to
 * tell a rider when the display will have something to say.
 */
export const useNextSunrise = (
  location: GeoLocation | undefined,
  enabled: boolean
): Date | null => {
  const now = useSunClock(enabled && location !== undefined);
  return useMemo(() => {
    if (!enabled || !location) return null;
    const at = new Date(now);
    if (getSunPosition(at, location).altitude > 0) return null;
    return getNextSunrise(location, at);
  }, [enabled, location, now]);
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
