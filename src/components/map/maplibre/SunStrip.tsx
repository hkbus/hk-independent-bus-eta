import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, useTheme, type SxProps, type Theme } from "@mui/material";
import {
  buildRouteAlignment,
  flattenRouteGeoJson,
  getSideExposure,
  getSolarProfile,
  snapStopSequenceToAlignment,
} from "../../../routeAlignment";
import { GeoJsonType } from "../../../hooks/useRoutePath";
import { StopListEntry } from "hk-bus-eta";

const STRIP_WIDTH_PX = 4;
const GRADIENT_STOP_COUNT = 96;
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

interface SunStripProps {
  routePath: GeoJsonType | null;
  side: "left" | "right";
  stops: StopListEntry[];
  fromStopIdx: number;
  journeyDurationMs?: number;
}

const SunStrip = ({
  routePath,
  side,
  stops,
  fromStopIdx,
  journeyDurationMs = 0,
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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), RECOMPUTE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const gradient = useMemo(() => {
    if (alignment.points.length < 2) return null;
    const samples = getSolarProfile(alignment, {
      startTime: now,
      durationMs: journeyDurationMs,
      count: GRADIENT_STOP_COUNT,
      fromMetres,
      toMetres,
    });
    if (samples.every(({ ele }) => ele <= 0)) return null;
    const ramp = isDark ? DARK_RAMP : LIGHT_RAMP;
    return `linear-gradient(to bottom, ${samples
      .map((sample) => sampleRamp(ramp, getSideExposure(sample, side)))
      .join(", ")})`;
  }, [alignment, now, journeyDurationMs, fromMetres, toMetres, isDark, side]);

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
