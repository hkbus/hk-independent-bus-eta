import { useMemo } from "react";
import { useMap } from "react-map-gl/maplibre";

/**
 * Lat/lng coordinate input. Either an `[lat, lng]` tuple or an
 * object — both are accepted. Internally we always translate to
 * MapLibre's `[lng, lat]` order before forwarding to the map.
 */
export type LatLngLike =
  | [lat: number, lng: number]
  | { lat: number; lng: number };

export type LatLngBoundsLike = [southWest: LatLngLike, northEast: LatLngLike];

const toLngLat = (p: LatLngLike): [number, number] =>
  Array.isArray(p) ? [p[1], p[0]] : [p.lng, p.lat];

export interface FlyToOpts {
  zoom?: number;
  duration?: number;
  bearing?: number;
  pitch?: number;
}

export interface FitBoundsOpts {
  padding?:
    | number
    | { top: number; bottom: number; left: number; right: number };
  animate?: boolean;
  duration?: number;
  maxZoom?: number;
}

/**
 * Thin wrapper around react-map-gl's `useMap` exposing the imperative
 * methods most call sites need (`flyTo`, `fitBounds`, `setView`,
 * `getCenter`, `getZoom`, `invalidateSize`) with `{lat, lng}`-shaped
 * arguments.
 *
 * Pass `mapId` if multiple `<Map>` instances are mounted at the same
 * time (matches the `id` prop on the corresponding `<Map>`). Returns
 * `null`-ish values when the map isn't mounted yet — call sites
 * should guard with `isReady()`.
 */
export const useImperativeMap = (mapId?: string) => {
  const maps = useMap();
  const ref = mapId ? maps[mapId] : maps.current;
  // `.getMap()` returns the underlying maplibre-gl `Map`, which has
  // the richer API surface (flyTo/fitBounds/etc are also on the ref
  // itself, but going through getMap() keeps the typings honest).
  const map = ref?.getMap();

  return useMemo(
    () => ({
      flyTo: (center: LatLngLike, opts: FlyToOpts = {}) => {
        map?.flyTo({ center: toLngLat(center), ...opts });
      },
      fitBounds: (bounds: LatLngBoundsLike, opts: FitBoundsOpts = {}) => {
        const [sw, ne] = bounds;
        map?.fitBounds([toLngLat(sw), toLngLat(ne)], opts);
      },
      /** Set center (and optionally zoom) without animation. */
      setView: (center: LatLngLike, zoom?: number) => {
        map?.jumpTo({ center: toLngLat(center), zoom });
      },
      panTo: (center: LatLngLike, opts?: { duration?: number }) => {
        map?.panTo(toLngLat(center), opts);
      },
      getCenter: (): { lat: number; lng: number } | null => {
        const c = map?.getCenter();
        return c ? { lat: c.lat, lng: c.lng } : null;
      },
      getZoom: (): number | null => map?.getZoom() ?? null,
      getBounds: (): LatLngBoundsLike | null => {
        const b = map?.getBounds();
        if (!b) return null;
        const sw = b.getSouthWest();
        const ne = b.getNorthEast();
        return [
          { lat: sw.lat, lng: sw.lng },
          { lat: ne.lat, lng: ne.lng },
        ];
      },
      /**
       * Recompute the map's pixel size — call after the container's
       * size has changed (drawer opens, orientation change, etc).
       */
      invalidateSize: () => {
        map?.resize();
      },
      /** Escape hatch for cases that need the raw maplibre instance. */
      getRawMap: () => map ?? null,
      /** True iff the map is mounted and ready. */
      isReady: () => map !== undefined,
    }),
    [map]
  );
};
