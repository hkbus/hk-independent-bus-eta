import { Box, useTheme, type SxProps, type Theme } from "@mui/material";

/**
 * Below which the sun is too close to straight ahead, straight behind,
 * or straight overhead for either side of the bus to be the better one
 * to sit on.
 */
export const SUN_SIDE_THRESHOLD = 0.15;
/** Where the sun stops getting any more sideways-on, for scaling. */
const SUN_SIDE_FULL = 0.6;

/**
 * The side taking the sun. Deep orange rather than a soft amber: the
 * app's own light theme is yellow, and an amber stroke on it says
 * nothing.
 */
const sunlitColour = (strength: number): string =>
  `rgba(230, 81, 0, ${(0.4 + 0.6 * strength).toFixed(2)})`;

/**
 * The side in shade — the one to sit on. Navy on a white row, steel on
 * a black one: a single colour dark enough to read against the light
 * theme is all but invisible against the dark one, which would leave
 * half the strokes unseen.
 */
const shadedColour = (strength: number, dark: boolean): string =>
  dark
    ? `rgba(96, 155, 214, ${(0.4 + 0.6 * strength).toFixed(2)})`
    : `rgba(21, 58, 95, ${(0.35 + 0.55 * strength).toFixed(2)})`;

/**
 * One stroke down the row's right edge, standing for the right-hand
 * side of the bus: orange if the sun falls on it, slate if that is the
 * shaded side. Nothing to read, and it does not touch the left edge —
 * that is already spoken for by the selected-stop rail.
 *
 * Nothing is drawn where the sun is too near head-on to call a side.
 * That is deliberate: a mark on every row would imply a confidence the
 * arithmetic does not have.
 */
const SunSideMark = ({
  value,
}: {
  /**
   * Which side of the bus the sun falls on over the leg leaving this
   * stop: −1 hard left … +1 hard right. Undefined after dark.
   */
  value?: number;
}) => {
  const dark = useTheme().palette.mode === "dark";
  if (value === undefined || Math.abs(value) < SUN_SIDE_THRESHOLD) return null;
  const strength = Math.min(1, Math.abs(value) / SUN_SIDE_FULL);
  return (
    <Box
      sx={strokeSx}
      style={{
        backgroundColor:
          value > 0 ? sunlitColour(strength) : shadedColour(strength, dark),
      }}
      aria-hidden="true"
    />
  );
};

export default SunSideMark;

/** In words, for anyone who cannot see the stroke. */
export const sunSideLabel = (value?: number): string | null => {
  if (value === undefined || Math.abs(value) < SUN_SIDE_THRESHOLD) return null;
  return value > 0 ? "陽光曬右邊" : "陽光曬左邊";
};

const strokeSx: SxProps<Theme> = {
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
  width: "6px",
  pointerEvents: "none",
};
