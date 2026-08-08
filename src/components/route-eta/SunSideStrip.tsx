import { Box, type SxProps, type Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  NEUTRAL_COLOUR,
  SUN_SIDE_THRESHOLD,
  shadedColour,
  sunSideStrength,
  sunlitColour,
} from "./sunSideStyle";

interface SunSideStripProps {
  /**
   * One value per stop, for the leg leaving it: −1 sun hard on the
   * left … +1 hard on the right.
   */
  sides: number[];
  /** Stop the page is currently showing. */
  stopIdx: number;
  /** First and last stop currently scrolled into view, if known. */
  visibleRange: [number, number] | null;
}

/**
 * Paints one lane as a hard-stopped gradient — one band per leg, so
 * the lane stays a single element however many stops the route has.
 */
const laneGradient = (sides: number[], lane: "left" | "right"): string => {
  const step = 100 / sides.length;
  const bands = sides.map((side, i) => {
    let colour: string;
    if (Math.abs(side) < SUN_SIDE_THRESHOLD) {
      colour = NEUTRAL_COLOUR;
    } else {
      const strength = sunSideStrength(side);
      const sunOnThisLane = lane === "left" ? side < 0 : side > 0;
      colour = sunOnThisLane ? sunlitColour(strength) : shadedColour(strength);
    }
    return `${colour} ${(i * step).toFixed(3)}% ${((i + 1) * step).toFixed(3)}%`;
  });
  return `linear-gradient(to right, ${bands.join(", ")})`;
};

/**
 * The whole journey on two lanes — the left side of the bus above,
 * the right below — so the side to sit on can be picked before
 * boarding rather than worked out stop by stop. Amber is sun, slate
 * is shade, grey is "makes no odds here"; sit on whichever lane is
 * darker for the stretch you are riding.
 *
 * A tick marks the stop the page is on and a bracket marks the
 * stretch the list below is scrolled to, so the strip and the list
 * read as one thing.
 *
 * The lanes are driven purely by a number per stop, so the same strip
 * could later carry a different per-stop measure.
 */
const SunSideStrip = ({ sides, stopIdx, visibleRange }: SunSideStripProps) => {
  const { t } = useTranslation();
  if (sides.length < 2) return null;

  const pct = (i: number) => (i / sides.length) * 100;

  return (
    <Box sx={rootSx}>
      <Box sx={lanesSx}>
        <Box sx={laneLabelsSx} aria-hidden="true">
          <Box component="span">{t("左")}</Box>
          <Box component="span">{t("右")}</Box>
        </Box>
        <Box sx={laneStackSx}>
          <Box
            sx={laneSx}
            style={{ backgroundImage: laneGradient(sides, "left") }}
          />
          <Box
            sx={laneSx}
            style={{ backgroundImage: laneGradient(sides, "right") }}
          />
          {visibleRange !== null && (
            <Box
              sx={windowSx}
              style={{
                left: `${pct(visibleRange[0])}%`,
                width: `${pct(visibleRange[1] + 1) - pct(visibleRange[0])}%`,
              }}
            />
          )}
          <Box sx={tickSx} style={{ left: `${pct(stopIdx + 0.5)}%` }} />
        </Box>
      </Box>
    </Box>
  );
};

export default SunSideStrip;

const rootSx: SxProps<Theme> = {
  position: "sticky",
  top: 0,
  zIndex: 3,
  px: 1,
  py: 0.75,
  // Not `background.default` — that is the app's yellow, which an
  // orange lane disappears into.
  backgroundColor: (theme) => theme.palette.background.paper,
  borderBottom: "1px solid rgba(0, 0, 0, .125)",
};

const lanesSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
};

const laneLabelsSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  width: "1em",
  flexShrink: 0,
  fontSize: "0.65rem",
  fontWeight: 700,
  lineHeight: "12px",
  opacity: 0.75,
};

const laneStackSx: SxProps<Theme> = {
  position: "relative",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "2px",
};

const laneSx: SxProps<Theme> = {
  height: "12px",
  borderRadius: "2px",
};

/** Outlines the stretch of route the stop list is scrolled to. */
const windowSx: SxProps<Theme> = {
  position: "absolute",
  top: "-2px",
  bottom: "-2px",
  border: "1px solid",
  borderColor: (theme) => theme.palette.text.primary,
  borderRadius: "3px",
  opacity: 0.55,
  pointerEvents: "none",
};

/** Where the page's selected stop sits along the route. */
const tickSx: SxProps<Theme> = {
  position: "absolute",
  top: "-4px",
  bottom: "-4px",
  width: "2px",
  marginLeft: "-1px",
  backgroundColor: (theme) => theme.palette.text.primary,
  pointerEvents: "none",
};
