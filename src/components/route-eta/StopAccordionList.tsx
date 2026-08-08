import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Box, Snackbar, SxProps, Theme } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import type { RouteListEntry } from "hk-bus-eta";
import throttle from "lodash.throttle";
import StopAccordion from "./StopAccordion";
import SunSideStrip, { SunAsleepNote } from "./SunSideStrip";
import { useTranslation } from "react-i18next";
import DbContext from "../../context/DbContext";
import { useNextSunrise, useSunExposure } from "../../hooks/useSunExposure";

interface StopAccordionsProps {
  routeId: string;
  stopIdx: number;
  routeListEntry: RouteListEntry;
  stopIds: string[];
  handleChange: (stopIdx: number, expanded: boolean) => void;
  onStopInfo: () => void;
  /** Whether the sun-side display is switched on. */
  sunMode: boolean;
  onToggleSunMode: () => void;
}
const StopAccordions = ({
  routeId,
  stopIdx,
  stopIds,
  handleChange,
  onStopInfo,
  sunMode,
  onToggleSunMode,
}: StopAccordionsProps) => {
  const accordionRef = useRef<HTMLDivElement[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [visibleRange, setVisibleRange] = useState<[number, number] | null>(
    null
  );
  const { t } = useTranslation();
  const {
    db: { stopList },
  } = useContext(DbContext);

  const stopLocations = useMemo(
    () => stopIds.map((stopId) => stopList[stopId].location),
    [stopIds, stopList]
  );
  const sun = useSunExposure(stopLocations, sunMode);
  const sunriseAt = useNextSunrise(stopLocations[0], sunMode);

  // Which stops the list is scrolled to, so the strip above can mark
  // the stretch of route being looked at.
  const syncVisibleRange = useMemo(
    () =>
      throttle(() => {
        const list = listRef.current;
        if (!list) return;
        const { top, bottom } = list.getBoundingClientRect();
        let first = -1;
        let last = -1;
        accordionRef.current.forEach((el, idx) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          if (rect.bottom > top && rect.top < bottom) {
            if (first === -1) first = idx;
            last = idx;
          }
        });
        setVisibleRange(first === -1 ? null : [first, last]);
      }, 100),
    []
  );

  useEffect(() => {
    if (!sun) return;
    syncVisibleRange();
    return () => syncVisibleRange.cancel();
  }, [sun, stopIdx, syncVisibleRange]);

  useEffect(() => {
    // scroll to specific bus stop
    // check acordion ref not null to ensure it is not in rendering
    if (accordionRef.current[stopIdx]) {
      // scroll in next rendering, i.e., all DOMs are well formed
      const scrollingTimeout = setTimeout(() => {
        accordionRef.current[stopIdx]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
      return () => {
        clearTimeout(scrollingTimeout);
      };
    }
  }, [stopIdx]);

  const handleRef = useCallback(
    (idx: number) => (el: HTMLDivElement) => {
      accordionRef.current[idx] = el;
    },
    []
  );

  return (
    <Box
      sx={rootSx}
      ref={listRef}
      onScroll={sun ? syncVisibleRange : undefined}
    >
      {/* The real sun-mode switch. The badge on the map is the visible
          one, but the map is deliberately aria-hidden and its controls
          are taken out of the tab order, so on its own it would be
          reachable by mouse only. This one carries the semantics and
          the keyboard, and shows itself when focused. */}
      <Box
        component="button"
        type="button"
        role="switch"
        aria-checked={sunMode}
        onClick={onToggleSunMode}
        sx={hiddenSwitchSx}
      >
        {t("防曬模式")}
      </Box>
      {sunMode &&
        (sun !== null ? (
          <SunSideStrip
            sides={sun.sides}
            stopIdx={stopIdx}
            visibleRange={visibleRange}
          />
        ) : (
          <SunAsleepNote sunriseAt={sunriseAt} />
        ))}
      {stopIds.map((stopId, idx) => (
        <StopAccordion
          routeId={routeId}
          stopId={stopId}
          stopIdx={stopIdx}
          idx={idx}
          onShareClick={() => setIsCopied(true)}
          onSummaryClick={handleChange}
          onStopInfoClick={onStopInfo}
          sunSide={sun?.sides[idx]}
          key={"stop-" + idx}
          ref={handleRef(idx)}
        />
      ))}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isCopied}
        autoHideDuration={1500}
        onClose={() => {
          setIsCopied(false);
        }}
        message={t("已複製到剪貼簿")}
      />
    </Box>
  );
};

export default StopAccordions;

const rootSx: SxProps<Theme> = {
  overflowY: "scroll",
};

// Out of the way until it is tabbed to, then shown — the map badge is
// the visible affordance for everyone else.
const hiddenSwitchSx: SxProps<Theme> = {
  ...visuallyHidden,
  "&:focus": {
    position: "sticky",
    top: 0,
    left: 0,
    width: "100%",
    height: "auto",
    clip: "auto",
    zIndex: (theme) => theme.zIndex.tooltip,
    p: 1,
    border: 0,
    font: "inherit",
    cursor: "pointer",
    backgroundColor: (theme) => theme.palette.background.paper,
    color: (theme) => theme.palette.text.primary,
  },
};
