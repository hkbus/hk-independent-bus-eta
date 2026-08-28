import { Box, type SxProps, type Theme } from "@mui/material";
import {
  EventSeat as EventSeatIcon,
  WbSunny as WbSunnyIcon,
} from "@mui/icons-material";

/**
 * Below which the sun is too close to straight ahead, straight behind,
 * or straight overhead for either side of the bus to be the better one
 * to sit on.
 */
export const SUN_SIDE_THRESHOLD = 0.15;
/** Room the mark needs at the row's right edge, in theme spacing units. */
export const SUN_MARK_RESERVE = 7;

/** The side taking the sun. */
const SUN_COLOUR = "rgba(230, 81, 0, 0.9)";
/** The seat to take — the shaded side. */
const SEAT_COLOUR = "rgba(2, 119, 189, 0.9)";

/**
 * A pair of pictograms on the right of the row: the sun on the side it
 * falls on, a seat on the side to take, laid out left-to-right as if
 * looking along the bus. Nothing to read, so it works in any language.
 *
 * It sits in the right-hand half of the row, which is empty space in
 * the existing layout, and does not touch the left edge — that is
 * already spoken for by the selected-stop rail.
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
  if (value === undefined || Math.abs(value) < SUN_SIDE_THRESHOLD) return null;
  const sunOnRight = value > 0;
  return (
    <Box sx={pillSx} aria-hidden="true">
      {sunOnRight ? <EventSeatIcon sx={seatSx} /> : <WbSunnyIcon sx={sunSx} />}
      {sunOnRight ? <WbSunnyIcon sx={sunSx} /> : <EventSeatIcon sx={seatSx} />}
    </Box>
  );
};

export default SunSideMark;

/** In words, for anyone who cannot see the pictograms. */
export const sunSideLabel = (value?: number): string | null => {
  if (value === undefined || Math.abs(value) < SUN_SIDE_THRESHOLD) return null;
  return value > 0 ? "陽光曬右邊" : "陽光曬左邊";
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
  // Theme token, so the outline survives dark mode.
  border: 1,
  borderColor: "divider",
  borderRadius: "4px",
  pointerEvents: "none",
};

const sunSx: SxProps<Theme> = { fontSize: 15, color: SUN_COLOUR };
const seatSx: SxProps<Theme> = { fontSize: 15, color: SEAT_COLOUR };
