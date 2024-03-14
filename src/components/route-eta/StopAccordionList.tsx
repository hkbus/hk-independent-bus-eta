import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { Box, SxProps, Theme } from "@mui/material";
import type { RouteListEntry } from "hk-bus-eta";
import StopAccordion from "./StopAccordion";
import { SharingEntry } from "../../@types/types";
const SharingModal = React.lazy(() => import("./SharingModal"));

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
  const [sharingObj, setSharingObj] = useState<SharingEntry | null>(null);
  const accordionRef = useRef<HTMLDivElement[]>([]);

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
      {stopIds.map((stopId, idx) => (
        <StopAccordion
          routeId={routeId}
          stopId={stopId}
          stopIdx={stopIdx}
          idx={idx}
          onShareClick={(obj) => setSharingObj(obj)}
          onSummaryClick={handleChange}
          onStopInfoClick={onStopInfo}
          key={"stop-" + idx}
          ref={handleRef(idx)}
        />
      ))}

      {sharingObj && (
        <Suspense fallback={<></>}>
          <SharingModal {...sharingObj} />
        </Suspense>
      )}
    </Box>
  );
};

export default StopAccordions;

const rootSx: SxProps<Theme> = {
  overflowY: "scroll",
};
