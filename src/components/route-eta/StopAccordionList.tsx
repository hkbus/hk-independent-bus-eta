import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Box, Snackbar, SxProps, Theme } from "@mui/material";
import type { RouteListEntry } from "hk-bus-eta";
import throttle from "lodash.throttle";
import StopAccordion from "./StopAccordion";
import SunSideStrip from "./SunSideStrip";
import { useTranslation } from "react-i18next";
import DbContext from "../../context/DbContext";
import { useSunExposure } from "../../hooks/useSunExposure";

interface StopAccordionsProps {
  routeId: string;
  stopIdx: number;
  routeListEntry: RouteListEntry;
  stopIds: string[];
  handleChange: (stopIdx: number, expanded: boolean) => void;
  onStopInfo: () => void;
  /** Whether the sun-side display is switched on. */
  sunMode: boolean;
}
const StopAccordions = ({
  routeId,
  stopIdx,
  stopIds,
  handleChange,
  onStopInfo,
  sunMode,
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
  const exposure = useSunExposure(stopLocations);
  const sun = sunMode ? exposure : null;

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
      {sun !== null && (
        <SunSideStrip
          sides={sun.sides}
          stopIdx={stopIdx}
          visibleRange={visibleRange}
        />
      )}
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
