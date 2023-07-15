import { useEffect, useState, useMemo, useContext, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  IconButton,
  Snackbar,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import loadable from "@loadable/component";
import DirectionsIcon from "@mui/icons-material/Directions";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import InfoIcon from "@mui/icons-material/Info";
import AppContext from "../../AppContext";
import { useTranslation } from "react-i18next";
import { toProperCase } from "../../utils";
import TimeReport from "./TimeReport";
import ShareIcon from "@mui/icons-material/Share";
import type { StopListEntry, RouteListEntry } from "hk-bus-eta";
const SharingModal = loadable(() => import("./SharingModal"));

interface StopAccordionsProps {
  routeId: string;
  stopIdx: number;
  routeListEntry: RouteListEntry;
  stopListExtracted: Array<StopListEntry>;
  expanded: boolean;
  handleChange: (stopIdx: number, expanded: boolean) => void;
  onStopInfo: () => void;
}
const StopAccordions = ({
  routeId,
  stopIdx,
  expanded,
  routeListEntry,
  stopListExtracted,
  handleChange,
  onStopInfo,
}: StopAccordionsProps) => {
  const id = routeId;
  const { savedEtas, setCollectionDrawerRoute } = useContext(AppContext);
  const [isCopied, setIsCopied] = useState(false);
  const [sharingObj, setSharingObj] = useState<any | null>(null);
  const { route, dest, fares, faresHoliday } = routeListEntry;
  const { t, i18n } = useTranslation();
  const accordionRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // scroll to specific bus stop
    // check acordion ref not null to ensure it is not in rendering
    if (expanded && accordionRef.current[stopIdx]) {
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
  }, [expanded, stopIdx]);

  const stopListElements = useMemo(() => {
    return stopListExtracted.map((stop, idx) => {
      const onClickShare = (e) => {
        setSharingObj({
          id,
          route,
          dest,
          idx,
          setIsCopied,
          stop,
          event: e,
        });
      };
      const handleChangeInner = (_: unknown, expand: boolean) => {
        handleChange(idx, expand);
      };
      const onClickDirection = () => {
        const { lat, lng } = stop.location;
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
        );
      };
      return (
        <Accordion
          id={`stop-${idx}`}
          key={"stop-" + idx}
          expanded={stopIdx === idx && expanded}
          onChange={handleChangeInner}
          TransitionProps={{ unmountOnExit: true }}
          ref={(el) => {
            if (el instanceof HTMLElement) {
              accordionRef.current[idx] = el;
              if (stopIdx === idx) {
                el.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }
            }
          }}
          sx={accordionSx}
        >
          <AccordionSummary sx={accordionSummarySx}>
            <Typography component="h3" variant="body1" sx={{ fontWeight: 700 }}>
              {idx + 1}. {toProperCase(stop.name[i18n.language])}
            </Typography>
            <Typography variant="body2">
              {fares && fares[idx] ? t("車費") + ": $" + fares[idx] : ""}
              {faresHoliday && faresHoliday[idx]
                ? "　　　　" + t("假日車費") + ": $" + faresHoliday[idx]
                : ""}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={accordionDetailsRootSx}>
            <TimeReport
              containerSx={accordionTimeReportSx}
              routeId={`${id.toUpperCase()}`}
              seq={idx}
            />
            <Box>
              <Box>
                <IconButton
                  aria-label="direction"
                  onClick={onClickDirection}
                  style={{ background: "transparent" }}
                  size="large"
                >
                  <DirectionsIcon />
                </IconButton>
                <IconButton
                  aria-label="stop-info"
                  onClick={onStopInfo}
                  style={{ background: "transparent" }}
                  size="large"
                >
                  <InfoIcon />
                </IconButton>
              </Box>
              <Box>
                <IconButton
                  aria-label="share"
                  onClick={onClickShare}
                  style={{ backgroundColor: "transparent" }}
                  size="large"
                >
                  <ShareIcon />
                </IconButton>
                <IconButton
                  aria-label="favourite"
                  onClick={() => {
                    const targetRouteId = `${id.toUpperCase()}/${idx}`;
                    setCollectionDrawerRoute(targetRouteId);
                  }}
                  style={{ backgroundColor: "transparent" }}
                  size="large"
                >
                  {savedEtas.includes(`${id.toUpperCase()}/${idx}`) ? (
                    <StarIcon />
                  ) : (
                    <StarBorderIcon />
                  )}
                </IconButton>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      );
    });
  }, [
    dest,
    expanded,
    fares,
    faresHoliday,
    handleChange,
    i18n.language,
    id,
    route,
    savedEtas,
    setSharingObj,
    stopIdx,
    stopListExtracted,
    t,
    setCollectionDrawerRoute,
    onStopInfo,
  ]);
  return (
    <Box sx={rootSx}>
      {stopListElements}
      {sharingObj && <SharingModal {...sharingObj} />}
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

const accordionSx: SxProps<Theme> = {
  border: "1px solid rgba(0, 0, 0, .125)",
  boxShadow: "none",
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: "auto",
  },
};

const accordionSummarySx: SxProps<Theme> = {
  backgroundColor: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : "rgba(0, 0, 0, .03)",
  "&.Mui-expanded": {
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    minHeight: 44,
  },
  minHeight: 44,
  "& .MuiAccordionSummary-content": {
    margin: "8px 0",
    flexDirection: "column",
    "&.Mui-expanded": {
      margin: "8px 0",
    },
  },
};

const accordionDetailsRootSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  pl: 2,
  pr: 1,
  py: 1,
  justifyContent: "space-between",
};

const accordionTimeReportSx: SxProps<Theme> = {
  flex: 1,
};
