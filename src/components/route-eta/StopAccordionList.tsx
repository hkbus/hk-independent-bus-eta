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
import StopAccordion from "./StopAccordion";
import { useTranslation } from "react-i18next";
import AppContext from "../../context/AppContext";
import DbContext from "../../context/DbContext";
import { useNextSunrise, useSunExposure } from "../../hooks/useSunExposure";

interface StopAccordionsProps {
  routeId: string;
  stopIdx: number;
  routeListEntry: RouteListEntry;
  stopIds: string[];
  handleChange: (stopIdx: number, expanded: boolean) => void;
  onStopInfo: () => void;
}
const StopAccordions = ({
  routeId,
  stopIdx,
  stopIds,
  handleChange,
  onStopInfo,
}: StopAccordionsProps) => {
  const accordionRef = useRef<HTMLDivElement[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { t } = useTranslation();
  const { sunSideHint } = useContext(AppContext);
  const {
    db: { stopList },
  } = useContext(DbContext);

  const stopLocations = useMemo(
    () =>
      sunSideHint ? stopIds.map((stopId) => stopList[stopId].location) : [],
    [sunSideHint, stopIds, stopList]
  );
  const sun = useSunExposure(stopLocations, sunSideHint);
  const sunriseAt = useNextSunrise(stopLocations[0], sunSideHint);

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
    <Box sx={rootSx}>
      {sunriseAt !== null && (
        <Box sx={asleepSx}>
          {t("太陽已下山")} · {t("日出")}{" "}
          {sunriseAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </Box>
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

/**
 * Stands in after dark. Says when the hint will next mean something,
 * rather than leaving a blank that reads as a fault.
 */
const asleepSx: SxProps<Theme> = {
  px: 1.5,
  py: 1,
  fontSize: "0.8rem",
  textAlign: "center",
  opacity: 0.75,
};
