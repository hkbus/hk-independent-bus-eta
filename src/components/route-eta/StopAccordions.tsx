import { useEffect, useState, useMemo, useContext, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import loadable from "@loadable/component";
import DirectionsIcon from "@mui/icons-material/Directions";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { styled } from "@mui/material/styles";
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
}
const StopAccordions = ({
  routeId,
  stopIdx,
  expanded,
  routeListEntry,
  stopListExtracted,
  handleChange,
}: StopAccordionsProps) => {
  const id = routeId;
  const { savedEtas, updateSavedEtas, energyMode } = useContext(AppContext);
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
        <StopAccordion
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
          classes={{
            root: classes.accordionRoot,
            expanded: classes.accordionExpanded,
          }}
        >
          <StopAccordionSummary
            classes={{
              root: classes.accordionSummaryRoot,
              content: classes.accordionSummaryContent,
              expanded: classes.accordionSummaryExpanded,
            }}
          >
            <Typography component="h3" variant="body1">
              {idx + 1}. {toProperCase(stop.name[i18n.language])}
            </Typography>
            <Typography variant="caption">
              {fares && fares[idx] ? t("車費") + ": $" + fares[idx] : ""}
              {faresHoliday && faresHoliday[idx]
                ? "　　　　" + t("假日車費") + ": $" + faresHoliday[idx]
                : ""}
            </Typography>
          </StopAccordionSummary>
          <StopAccordionDetails
            classes={{ root: classes.accordionDetailsRoot }}
          >
            <TimeReport
              containerClass={classes.accordionTimeReport}
              routeId={`${id.toUpperCase()}`}
              seq={idx}
            />
            <div style={{ display: "flex" }}>
              <IconButton
                aria-label="direction"
                onClick={onClickDirection}
                style={{ background: "transparent" }}
                size="large"
              >
                <DirectionsIcon />
              </IconButton>
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
                onClick={() => updateSavedEtas(`${id.toUpperCase()}/${idx}`)}
                style={{ backgroundColor: "transparent" }}
                size="large"
              >
                {savedEtas.includes(`${id.toUpperCase()}/${idx}`) ? (
                  <StarIcon />
                ) : (
                  <StarBorderIcon />
                )}
              </IconButton>
            </div>
          </StopAccordionDetails>
        </StopAccordion>
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
    updateSavedEtas,
  ]);
  return (
    <StopAccordionsBox
      className={
        !energyMode ? classes.boxContainer : classes.boxContainerEnergy
      }
    >
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
    </StopAccordionsBox>
  );
};

export default StopAccordions;

const PREFIX = "stopAccordions";

const classes = {
  boxContainer: `${PREFIX}-boxContainer`,
  boxContainerEnergy: `${PREFIX}-boxContainerEnergy`,
  accordionRoot: `${PREFIX}-accordion-root`,
  accordionExpanded: `${PREFIX}-accordion-expanded`,
  accordionSummaryRoot: `${PREFIX}-summary-root`,
  accordionSummaryContent: `${PREFIX}-summary-content`,
  accordionSummaryExpanded: `${PREFIX}-summary-expanded`,
  accordionDetailsRoot: `${PREFIX}-details-root`,
  accordionTimeReport: `${PREFIX}-accordionTimeReport`,
};

const StopAccordionsBox = styled(Box)(({ theme }) => ({
  [`&.${classes.boxContainer}`]: {
    overflowY: "scroll",
  },
  [`&.${classes.boxContainerEnergy}`]: {
    overflowY: "scroll",
  },
}));

const StopAccordion = styled(Accordion)(({ theme }) => ({
  [`&.${classes.accordionRoot}`]: {
    border: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    [`&.${classes.accordionExpanded}`]: {
      margin: "auto",
    },
  },
}));

const StopAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  [`&.${classes.accordionSummaryRoot}`]: {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "rgba(0, 0, 0, .03)",
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    marginBottom: -1,
    minHeight: 44,
    [`&.${classes.accordionSummaryExpanded}`]: {
      minHeight: 44,
    },
    [`& .${classes.accordionSummaryContent}`]: {
      margin: "8px 0",
      flexDirection: "column",
      [`&.${classes.accordionSummaryExpanded}`]: {
        margin: "8px 0",
      },
    },
  },
}));

const StopAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  [`&.${classes.accordionDetailsRoot}`]: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    justifyContent: "space-between",
    display: "flex",
  },
  [`& .${classes.accordionTimeReport}`]: {
    flex: 1,
  },
}));
