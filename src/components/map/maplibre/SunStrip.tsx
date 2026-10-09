import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, useTheme, type SxProps, type Theme } from "@mui/material";
import {
  buildRouteAlignment,
  flattenRouteGeoJson,
  getSideExposure,
  getSolarProfile,
  resampleAlignment,
  snapStopSequenceToAlignment,
} from "../../../routeAlignment";
import { GeoJsonType } from "../../../hooks/useRoutePath";
import { StopListEntry } from "hk-bus-eta";

const STRIP_WIDTH_PX = 4;
const GRADIENT_STOP_COUNT = 96;
// Denser than GRADIENT_STOP_COUNT: just lat/lng interpolation (no solar
// math), so this stays cheap even at high zoom where the viewport can be
// narrower than the gap between two gradient stops.
const BOUNDS_SAMPLE_COUNT = 400;
const RECOMPUTE_INTERVAL_MS = 10 * 60 * 1000;
const OPACITY_GAMMA = 0.55;

// One-hue sequential ramps, each stepped for its own surface. dataviz palette.
const LIGHT_RAMP = ["#e6867b", "#e3685e", "#dc4941", "#d02526", "#c00007"];
const DARK_RAMP = ["#c74b43", "#e1564d", "#f96055", "#ff6e62", "#ff7f72"];

const channelAt = (hex: string, i: number) =>
  parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);

const sampleRamp = (ramp: string[], fraction: number) => {
  const exposure = Math.min(1, Math.max(0, fraction));
  const scaled = exposure * (ramp.length - 1);
  const step = Math.min(ramp.length - 2, Math.floor(scaled));
  const within = scaled - step;
  const [red, green, blue] = [0, 1, 2].map((i) =>
    Math.round(
      channelAt(ramp[step], i) +
        (channelAt(ramp[step + 1], i) - channelAt(ramp[step], i)) * within
    )
  );
  const opacity = Math.pow(exposure, OPACITY_GAMMA);
  return `rgba(${red}, ${green}, ${blue}, ${opacity.toFixed(3)})`;
};

const stripSx: SxProps<Theme> = {
  flex: `0 0 ${STRIP_WIDTH_PX}px`,
  height: "35vh",
};

type LatLng = { lat: number; lng: number };

interface SunStripProps {
  routePath: GeoJsonType | null;
  side: "left" | "right";
  stops: StopListEntry[];
  fromStopIdx: number;
  journeyDurationMs?: number;
  /** Current map viewport (south-west, north-east corners); restricts the
   *  sampled range to what's on screen so the strip doesn't imply sun
   *  exposure for a part of the journey the map isn't currently showing.
   *  `null` = full journey. */
  mapBounds?: [LatLng, LatLng] | null;
}

const isInBounds = ({ lat, lng }: LatLng, [sw, ne]: [LatLng, LatLng]) =>
  lat >= sw.lat && lat <= ne.lat && lng >= sw.lng && lng <= ne.lng;

const SunStrip = ({
  routePath,
  side,
  stops,
  fromStopIdx,
  journeyDurationMs = 0,
  mapBounds = null,
}: SunStripProps) => {
  const { t } = useTranslation();
  const isDark = useTheme().palette.mode === "dark";
  const [now, setNow] = useState(() => new Date());

  const alignment = useMemo(
    () => buildRouteAlignment(flattenRouteGeoJson(routePath)),
    [routePath]
  );
  const snappedStops = useMemo(
    () =>
      snapStopSequenceToAlignment(
        alignment,
        stops.map(({ location }) => location)
      ),
    [alignment, stops]
  );

  const fromMetres = useMemo(
    () => snappedStops[fromStopIdx]?.distanceMetres || 0,
    [fromStopIdx, snappedStops]
  );
  const toMetres = useMemo(
    () => snappedStops[stops.length - 1]?.distanceMetres || 0,
    [stops, snappedStops]
  );

  // Clip [fromMetres, toMetres] down to whatever's currently on screen, so
  // the strip tracks the map instead of always describing the whole
  // remaining journey. `null` bounds (map not loaded yet) keeps full range.
  const visibleRange = useMemo((): [number, number] | null => {
    if (!mapBounds) return [fromMetres, toMetres];
    if (alignment.points.length < 2) return null;
    // Sample at the same resolution as the gradient itself — checking the
    // sparse route vertices directly can miss entirely when zoomed in
    // tight enough that no vertex happens to land inside the viewport.
    const samples = resampleAlignment(
      alignment,
      BOUNDS_SAMPLE_COUNT,
      fromMetres,
      toMetres
    );
    let visLo = Infinity;
    let visHi = -Infinity;
    samples.forEach(({ distanceMetres, ...point }) => {
      if (!isInBounds(point, mapBounds)) return;
      if (distanceMetres < visLo) visLo = distanceMetres;
      if (distanceMetres > visHi) visHi = distanceMetres;
    });
    return visLo <= visHi ? [visLo, visHi] : null;
  }, [alignment, fromMetres, toMetres, mapBounds]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), RECOMPUTE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const gradient = useMemo(() => {
    if (alignment.points.length < 2) return null;
    if (!visibleRange) return null;
    const samples = getSolarProfile(alignment, {
      startTime: now,
      durationMs: journeyDurationMs,
      count: GRADIENT_STOP_COUNT,
      fromMetres: visibleRange[0],
      toMetres: visibleRange[1],
    });
    if (samples.every(({ ele }) => ele <= 0)) return null;
    const ramp = isDark ? DARK_RAMP : LIGHT_RAMP;
    return `linear-gradient(to bottom, ${samples
      .map((sample) => sampleRamp(ramp, getSideExposure(sample, side)))
      .join(", ")})`;
  }, [alignment, now, journeyDurationMs, visibleRange, isDark, side]);

  if (gradient === null) return null;

  return (
    <Box
      role="img"
      aria-label={side === "left" ? t("左邊日照") : t("右邊日照")}
      sx={stripSx}
      style={{ backgroundImage: gradient }}
    />
  );
};

export default SunStrip;
