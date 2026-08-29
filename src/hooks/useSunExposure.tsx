import { useEffect, useMemo, useState } from "react";
import type { Location as GeoLocation } from "hk-bus-eta";
import {
  getNextSunrise,
  getRouteSunExposure,
  getSunPosition,
  type RouteSunExposure,
} from "../sun";

const REFRESH_MS = 5 * 60 * 1000;

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

/** When the sun next rises, or `null` while it is already up. */
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

// Disabled starts no timer and does no arithmetic, so it costs nothing when off.
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
