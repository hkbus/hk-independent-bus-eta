import type { Feature, Polygon } from "geojson";

/**
 * Build a closed geodesic polygon approximating a circle of the given
 * radius (meters) around (lng, lat). 64 vertices is plenty for
 * visually-smooth rendering at any zoom we'd ever reach.
 *
 * Uses a flat-earth approximation that's accurate to <0.1% at HK
 * latitudes for the small radii we use (≤ a few km).
 */
export const buildGeodesicCirclePolygon = (
  lng: number,
  lat: number,
  radiusMeters: number,
  segments = 64
): Feature<Polygon> => {
  const earthRadius = 6_378_137;
  const dLat = (radiusMeters / earthRadius) * (180 / Math.PI);
  const dLng =
    (radiusMeters / (earthRadius * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI);

  const coordinates: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    coordinates.push([
      lng + dLng * Math.cos(theta),
      lat + dLat * Math.sin(theta),
    ]);
  }
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coordinates] },
  };
};
