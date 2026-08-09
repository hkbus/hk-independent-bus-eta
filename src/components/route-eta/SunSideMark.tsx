import { Box, type SxProps, type Theme } from "@mui/material";
import {
  EventSeat as EventSeatIcon,
  WbSunny as WbSunnyIcon,
} from "@mui/icons-material";
import type { SunSideStyle } from "../../data";
import {
  SUN_BAR_COLOUR,
  SUN_SIDE_THRESHOLD,
  SEAT_COLOUR,
  shadedColour,
  sunSideStrength,
  sunlitColour,
} from "./sunSideStyle";

interface SunSideMarkProps {
  /**
   * Which side of the bus the sun falls on over the leg leaving this
   * stop: −1 hard left … +1 hard right. Undefined after dark.
   */
  value?: number;
  style: SunSideStyle;
}

/**
 * The per-stop mark, in whichever form the rider picked.
 *
 * Both forms sit in the right-hand half of the row, which is empty
 * space in the existing layout, and neither touches the left edge —
 * that is already spoken for by the selected-stop rail.
 *
 * Nothing is drawn where the sun is too near head-on to call a side.
 * That is deliberate: a mark on every row would imply a confidence the
 * arithmetic does not have.
 */
const SunSideMark = ({ value, style }: SunSideMarkProps) => {
  if (value === undefined || Math.abs(value) < SUN_SIDE_THRESHOLD) return null;
  const sunOnRight = value > 0;
  const strength = sunSideStrength(value);

  if (style === "bar") {
    // One stroke down the row's right edge, standing for the right-hand
    // side of the bus: amber if the sun is on it, slate if that is the
    // shaded side. No reading required, but it is colour alone — which
    // is why it is not the default.
    return (
      <Box
        sx={strokeSx}
        style={{
          backgroundColor: sunOnRight
            ? sunlitColour(strength)
            : shadedColour(strength),
        }}
        aria-hidden="true"
      />
    );
  }

  if (style === "icon") {
    // Sun on the side it falls on, seat on the side to take, laid out
    // left-to-right as if looking along the bus.
    return (
      <Box sx={pillSx} aria-hidden="true">
        {sunOnRight ? (
          <EventSeatIcon sx={seatSx} />
        ) : (
          <WbSunnyIcon sx={sunSx} />
        )}
        {sunOnRight ? (
          <WbSunnyIcon sx={sunSx} />
        ) : (
          <EventSeatIcon sx={seatSx} />
        )}
      </Box>
    );
  }

  return null;
};

export default SunSideMark;

/** In words, for anyone who cannot see either mark. */
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

const pillSx: SxProps<Theme> = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  alignItems: "center",
  gap: "3px",
  px: "3px",
  py: "2px",
  border: "1px solid rgba(0, 0, 0, .2)",
  borderRadius: "4px",
  pointerEvents: "none",
};

const sunSx: SxProps<Theme> = { fontSize: 15, color: SUN_BAR_COLOUR };
const seatSx: SxProps<Theme> = { fontSize: 15, color: SEAT_COLOUR };
