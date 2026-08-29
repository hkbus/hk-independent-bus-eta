import { Box, type SxProps, type Theme } from "@mui/material";
import {
  EventSeat as EventSeatIcon,
  WbSunny as WbSunnyIcon,
} from "@mui/icons-material";

// Below this the sun is too near head-on to call a side.
export const SUN_SIDE_THRESHOLD = 0.15;
/** Room the mark needs at the row's right edge, in theme spacing units. */
export const SUN_MARK_RESERVE = 7;

const SUN_COLOUR = "rgba(230, 81, 0, 0.9)";
const SEAT_COLOUR = "rgba(2, 119, 189, 0.9)";

// Sun on the side it falls on, seat on the side to take, as if looking along the bus.
const SunSideMark = ({
  value,
}: {
  /** −1 hard left … +1 hard right; undefined after dark. */
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
