/**
 * Sunrise / sunset calculation, computed locally (no network).
 * Adapted from the algorithm used by suncalc (https://github.com/mourner/suncalc),
 * which is based on http://aa.quae.nl/en/reken/zonpositie.html formulas.
 */

const PI = Math.PI;
const rad = PI / 180;
const dayMs = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;
const J0 = 0.0009;
// obliquity of the Earth
const e = rad * 23.4397;
// sun altitude at sunrise / sunset, accounting for refraction and sun radius
const SUNRISE_ALTITUDE = -0.833 * rad;

const toJulian = (date: Date) => date.valueOf() / dayMs - 0.5 + J1970;
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * dayMs);
const toDays = (date: Date) => toJulian(date) - J2000;

const solarMeanAnomaly = (d: number) => rad * (357.5291 + 0.98560028 * d);

const eclipticLongitude = (M: number) => {
  // equation of center
  const C =
    rad *
    (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  // perihelion of the Earth
  const P = rad * 102.9372;
  return M + C + P + PI;
};

const declination = (l: number) => Math.asin(Math.sin(e) * Math.sin(l));

const julianCycle = (d: number, lw: number) =>
  Math.round(d - J0 - lw / (2 * PI));

const approxTransit = (Ht: number, lw: number, n: number) =>
  J0 + (Ht + lw) / (2 * PI) + n;

const solarTransitJ = (ds: number, M: number, L: number) =>
  J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);

const hourAngleCos = (h: number, phi: number, dec: number) =>
  (Math.sin(h) - Math.sin(phi) * Math.sin(dec)) /
  (Math.cos(phi) * Math.cos(dec));

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

/**
 * Sunrise and sunset of the solar day whose noon is nearest to `date`.
 * Returns "polar-day" / "polar-night" where the sun does not rise or set.
 */
export const getSunTimes = (
  date: Date,
  lat: number,
  lng: number
): SunTimes | "polar-day" | "polar-night" => {
  const lw = rad * -lng;
  const phi = rad * lat;
  const d = toDays(date);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L);
  const Jnoon = solarTransitJ(ds, M, L);
  const cosW = hourAngleCos(SUNRISE_ALTITUDE, phi, dec);
  if (cosW > 1) return "polar-night";
  if (cosW < -1) return "polar-day";
  const w = Math.acos(cosW);
  const Jset = solarTransitJ(approxTransit(w, lw, n), M, L);
  const Jrise = Jnoon - (Jset - Jnoon);
  return { sunrise: fromJulian(Jrise), sunset: fromJulian(Jset) };
};

/**
 * Whether it is daytime at the given place, plus when that next changes.
 */
export const getDaylightState = (
  now: Date,
  lat: number,
  lng: number
): { isDaytime: boolean; nextChange: Date | null } => {
  const today = getSunTimes(now, lat, lng);
  const dailyTimes = [-1, 0, 1]
    .map((offset) =>
      getSunTimes(new Date(now.valueOf() + offset * dayMs), lat, lng)
    )
    .flatMap((t) => (typeof t === "string" ? [] : [t.sunrise, t.sunset]))
    .filter((t) => t > now)
    .sort((a, b) => a.valueOf() - b.valueOf());
  if (typeof today === "string") {
    // no sunrise / sunset today: re-check in an hour if none is coming soon
    return {
      isDaytime: today === "polar-day",
      nextChange: dailyTimes[0] ?? new Date(now.valueOf() + dayMs / 24),
    };
  }
  // the solar day nearest to `now` always contains the current daylight
  // period, so anything outside [sunrise, sunset) is night
  const isDaytime = now >= today.sunrise && now < today.sunset;
  return { isDaytime, nextChange: dailyTimes[0] ?? null };
};
