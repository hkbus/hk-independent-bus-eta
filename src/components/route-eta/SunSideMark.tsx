import { Box, useTheme, type SxProps, type Theme } from "@mui/material";

// Below this the sun is too near head-on or overhead to call a side.
export const SUN_SIDE_THRESHOLD = 0.15;
const SUN_SIDE_FULL = 0.6;

// Deep orange, not amber: the light theme is itself yellow.
const sunlitColour = (strength: number): string =>
  `rgba(230, 81, 0, ${(0.4 + 0.6 * strength).toFixed(2)})`;

// Two shades: one dark enough for the light theme is invisible on the dark one.
const shadedColour = (strength: number, dark: boolean): string =>
  dark
    ? `rgba(96, 155, 214, ${(0.4 + 0.6 * strength).toFixed(2)})`
    : `rgba(21, 58, 95, ${(0.35 + 0.55 * strength).toFixed(2)})`;

const SunSideMark = ({
  value,
}: {
  /** −1 hard left … +1 hard right; undefined after dark. */
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
