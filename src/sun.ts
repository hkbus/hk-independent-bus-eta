import type { Location as GeoLocation } from "hk-bus-eta";

/**
 * Solar position, and from it which side of a bus the sun falls on.
 *
 * The astronomy is the standard low-precision solar ephemeris (mean
 * anomaly → equation of the centre → ecliptic longitude → equatorial
 * coordinates → horizontal coordinates), as set out in
 * https://aa.quae.nl/en/reken/zonpositie.html. Accurate to roughly a
 * tenth of a degree for the next century, which is far finer than
 * "left or right of the bus" needs.
 */

const RAD = Math.PI / 180;
const DAY_MS = 1000 * 60 * 60 * 24;
/** Julian day number of the Unix epoch, and of J2000.0. */
const J1970 = 2440588;
const J2000 = 2451545;
/** Mean obliquity of the ecliptic. */
const OBLIQUITY = 23.4397 * RAD;
/** Longitude of the Earth's perihelion. */
const PERIHELION = 102.9372 * RAD;

/** Days since J2000.0. */
const toDays = (date: Date) => date.valueOf() / DAY_MS - 0.5 + J1970 - J2000;

export interface SunPosition {
  /** Bearing of the sun, degrees clockwise from true north. */
  azimuth: number;
  /** Height of the sun above the horizon, in degrees. */
  altitude: number;
}

export const getSunPosition = (
  date: Date,
  { lat, lng }: GeoLocation
): SunPosition => {
  const d = toDays(date);

  // Sun in ecliptic coordinates. Its ecliptic latitude is ~0, which
  // is why the declination below drops the usual latitude terms.
  const meanAnomaly = (357.5291 + 0.98560028 * d) * RAD;
  const centre =
    (1.9148 * Math.sin(meanAnomaly) +
      0.02 * Math.sin(2 * meanAnomaly) +
      0.0003 * Math.sin(3 * meanAnomaly)) *
    RAD;
  const eclipticLng = meanAnomaly + centre + PERIHELION + Math.PI;

  // …then equatorial…
  const declination = Math.asin(Math.sin(OBLIQUITY) * Math.sin(eclipticLng));
  const rightAscension = Math.atan2(
    Math.sin(eclipticLng) * Math.cos(OBLIQUITY),
    Math.cos(eclipticLng)
  );

  // …then horizontal, for the observer.
  const hourAngle =
    (280.16 + 360.9856235 * d) * RAD + lng * RAD - rightAscension;
  const phi = lat * RAD;
  const altitude = Math.asin(
    Math.sin(phi) * Math.sin(declination) +
      Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle)
  );
  // atan2 form yields the azimuth measured from south, westward.
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

/**
 * When the sun next clears the horizon at `location`, or `null` if it
 * somehow does not within a day — which cannot happen at Hong Kong's
 * latitude, but can inside the polar circles.
 *
 * Found by bisection on the altitude rather than by the closed-form
 * sunrise equation: it is a dozen calls to `getSunPosition`, runs
 * once when the sun is down, and cannot disagree with the altitude
 * the rest of the feature is drawing from.
 */
export const getNextSunrise = (
  location: GeoLocation,
  from: Date = new Date()
): Date | null => {
  const MINUTE = 60 * 1000;
  const altitudeAt = (t: number) =>
    getSunPosition(new Date(t), location).altitude;

  // Step forward in coarse jumps to bracket the crossing…
  let lo = from.valueOf();
  if (altitudeAt(lo) > 0) return from;
  let hi = lo;
  for (let step = 0; step < 24 * 4; ++step) {
    hi = lo + 15 * MINUTE;
    if (altitudeAt(hi) > 0) {
      // …then bisect it to the nearest minute.
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

export interface RouteSunExposure {
  /** Bearing of the sun, degrees clockwise from true north. */
  azimuth: number;
  /** Height of the sun above the horizon, in degrees. */
  altitude: number;
  /**
   * One entry per stop, describing the leg that *starts* at that stop:
   * −1 means the sun is square on the left of the bus, +1 square on
   * the right, 0 straight ahead, straight behind, or directly
   * overhead.
   *
   * The last stop carries the leg that *arrives* instead, having no
   * onward one — which is also what a rider wants there, and what
   * circular routes need, since their stop lists run the loop right
   * back round to the starting stop.
   */
  sides: number[];
}

/**
 * Where the sun falls along a route at a given moment, or `null` if
 * the sun is below the horizon or the route has no usable geometry.
 *
 * The magnitude folds in the sun's altitude: a sun that is nearly
 * overhead lights both sides of the bus about equally, so it scores
 * near zero however the road runs.
 */
export const getRouteSunExposure = (
  locations: GeoLocation[],
  date: Date = new Date()
): RouteSunExposure | null => {
  if (locations.length < 2) return null;
  const { azimuth, altitude } = getSunPosition(date, locations[0]);
  if (altitude <= 0) return null;

  const glare = Math.cos(altitude * RAD);
  // Walked backwards so that a stop repeated at the same coordinates —
  // which has no heading of its own — takes the heading of the next
  // leg that does move. Going forwards would hand it the leg it
  // arrived on, and describe the bus's last turn instead of its next.
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
  // The final stop has no onward leg, so it keeps the arriving one.
  sides[locations.length - 1] = sides[locations.length - 2];

  return { azimuth, altitude, sides };
};
