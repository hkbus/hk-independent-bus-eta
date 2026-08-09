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
import { SunAsleepNote, SunSideSentence } from "./SunSideHint";
import { useTranslation } from "react-i18next";
import AppContext from "../../context/AppContext";
import DbContext from "../../context/DbContext";
import { useNextSunrise, useSunExposure } from "../../hooks/useSunExposure";
import { getDistance } from "../../utils";

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
  const { sunSideStyle } = useContext(AppContext);
  const {
    db: { stopList },
  } = useContext(DbContext);

  const stopLocations = useMemo(
    () => stopIds.map((stopId) => stopList[stopId].location),
    [stopIds, stopList]
  );
  // The map style draws on the map instead, so the list does no work
  // for it — and "off" does no work at all.
  const listWantsSun = sunSideStyle !== "off" && sunSideStyle !== "map";
  const sun = useSunExposure(stopLocations, listWantsSun);
  const sunriseAt = useNextSunrise(stopLocations[0], listWantsSun);

  const legLengths = useMemo(
    () =>
      stopLocations.map((loc, i) =>
        i < stopLocations.length - 1
          ? Math.max(1, getDistance(loc, stopLocations[i + 1]))
          : 1
      ),
    [stopLocations]
  );

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
      {listWantsSun && (
        <Box sx={hintSx}>
          {sun === null ? (
            <SunAsleepNote sunriseAt={sunriseAt} />
          ) : sunSideStyle === "text" ? (
            <SunSideSentence sides={sun.sides} weights={legLengths} />
          ) : null}
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
          sunSide={sunSideStyle === "text" ? undefined : sun?.sides[idx]}
          sunSideStyle={sunSideStyle}
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

/** Sticks to the top of the list so the verdict stays in view. */
const hintSx: SxProps<Theme> = {
  position: "sticky",
  top: 0,
  zIndex: 3,
  backgroundColor: (theme) => theme.palette.background.paper,
  borderBottom: "1px solid rgba(0, 0, 0, .125)",
  "&:empty": { display: "none" },
};
