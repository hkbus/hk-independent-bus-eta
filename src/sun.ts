import type { Location as GeoLocation } from "hk-bus-eta";

// Low-precision solar ephemeris, per https://aa.quae.nl/en/reken/zonpositie.html.

const RAD = Math.PI / 180;
const DAY_MS = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;
const OBLIQUITY = 23.4397 * RAD;
const PERIHELION = 102.9372 * RAD;

const toDays = (date: Date) => date.valueOf() / DAY_MS - 0.5 + J1970 - J2000;

/** Sun bearing, degrees clockwise from true north; height above the horizon. */
export interface SunPosition {
  azimuth: number;
  altitude: number;
}

export const getSunPosition = (
  date: Date,
  { lat, lng }: GeoLocation
): SunPosition => {
  const d = toDays(date);

  const meanAnomaly = (357.5291 + 0.98560028 * d) * RAD;
  const centre =
    (1.9148 * Math.sin(meanAnomaly) +
      0.02 * Math.sin(2 * meanAnomaly) +
      0.0003 * Math.sin(3 * meanAnomaly)) *
    RAD;
  const eclipticLng = meanAnomaly + centre + PERIHELION + Math.PI;

  const declination = Math.asin(Math.sin(OBLIQUITY) * Math.sin(eclipticLng));
  const rightAscension = Math.atan2(
    Math.sin(eclipticLng) * Math.cos(OBLIQUITY),
    Math.cos(eclipticLng)
  );

  const hourAngle =
    (280.16 + 360.9856235 * d) * RAD + lng * RAD - rightAscension;
  const phi = lat * RAD;
  const altitude = Math.asin(
    Math.sin(phi) * Math.sin(declination) +
      Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle)
  );
  const azimuthFromSouth = Math.atan2(
    Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(phi) - Math.tan(declination) * Math.cos(phi)
  );

  return {
    azimuth: (azimuthFromSouth / RAD + 180 + 360) % 360,
    altitude: altitude / RAD,
  };
};

/** Initial great-circle bearing from `a` to `b`, degrees from north. */
export const getBearing = (a: GeoLocation, b: GeoLocation): number => {
  const phi1 = a.lat * RAD;
  const phi2 = b.lat * RAD;
  const dLng = (b.lng - a.lng) * RAD;
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  return (Math.atan2(y, x) / RAD + 360) % 360;
};

/** Next sunrise at `location`, or `null` if none within a day (polar only). */
export const getNextSunrise = (
  location: GeoLocation,
  from: Date = new Date()
): Date | null => {
  const MINUTE = 60 * 1000;
  const altitudeAt = (t: number) =>
    getSunPosition(new Date(t), location).altitude;

  let lo = from.valueOf();
  if (altitudeAt(lo) > 0) return from;
  let hi = lo;
  for (let step = 0; step < 24 * 4; ++step) {
    hi = lo + 15 * MINUTE;
    if (altitudeAt(hi) > 0) {
      while (hi - lo > MINUTE) {
        const mid = lo + (hi - lo) / 2;
        if (altitudeAt(mid) > 0) hi = mid;
        else lo = mid;
      }
      return new Date(hi);
    }
    lo = hi;
  }
  return null;
};

export interface RouteSunExposure extends SunPosition {
  // Per stop, for the leg leaving it: −1 sun square left, +1 square right.
  // The last stop keeps its arriving leg.
  sides: number[];
}

export const getRouteSunExposure = (
  locations: GeoLocation[],
  date: Date = new Date()
): RouteSunExposure | null => {
  if (locations.length < 2) return null;
  const { azimuth, altitude } = getSunPosition(date, locations[0]);
  if (altitude <= 0) return null;

  // A sun near overhead lights both sides equally, so it scores near zero.
  const glare = Math.cos(altitude * RAD);
  // Backwards, so a stop repeated at the same coordinates takes the heading of
  // the next leg that moves rather than the one it arrived on.
  const sides = locations.map(() => 0);
  let ahead = 0;
  for (let i = locations.length - 2; i >= 0; --i) {
    if (
      locations[i].lat !== locations[i + 1].lat ||
      locations[i].lng !== locations[i + 1].lng
    ) {
      const heading = getBearing(locations[i], locations[i + 1]);
      ahead = Math.sin((azimuth - heading) * RAD) * glare;
    }
    sides[i] = ahead;
  }
  sides[locations.length - 1] = sides[locations.length - 2];

  return { azimuth, altitude, sides };
};
