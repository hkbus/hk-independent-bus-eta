import { useEffect, useState, useMemo, useContext, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  IconButton,
  Snackbar,
  Typography,
} from "@material-ui/core";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import { makeStyles } from "@material-ui/core/styles";
import AppContext from "../../AppContext";
import { useTranslation } from "react-i18next";
import { toProperCase, triggerShare } from "../../utils";
import TimeReport from "./TimeReport";
import ShareIcon from "@material-ui/icons/Share";
import type { StopEntry, RouteListEntry } from "../../DbContext";

interface StopAccordionsProps {
  routeId: string;
  stopIdx: number;
  routeListEntry: RouteListEntry;
  stopListExtracted: Array<StopEntry>;
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
  const { AppTitle, savedEtas, updateSavedEtas, energyMode } =
    useContext(AppContext);
  const [isCopied, setIsCopied] = useState(false);
  const { route, dest, fares, faresHoliday } = routeListEntry;
  const { t, i18n } = useTranslation();
  const accordionRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // scroll to specific bus stop
    // check acordion ref not null to ensure it is not in rendering
    if (expanded && accordionRef.current[stopIdx]) {
      accordionRef.current[stopIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [expanded, stopIdx]);

  useStyles();

  const stopListElements = useMemo(() => {
    return stopListExtracted.map((stop, idx) => {
      const onClickShare = () => {
        triggerShare(
          `https://${window.location.hostname}/${i18n.language}/${id}`,
          `${idx + 1}. ${toProperCase(stop.name[i18n.language])} - ${route} ${t(
            "往"
          )} ${toProperCase(dest[i18n.language])} - ${t(AppTitle)}`
        ).then(() => {
          if (navigator.clipboard) setIsCopied(true);
        });
      };
      const handleChangeInner = (_: unknown, expand: boolean) => {
        handleChange(idx, expand);
      };
      return (
        <Accordion
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
          classes={{ root: "accordion-root", expanded: "accordion-expanded" }}
        >
          <AccordionSummary
            classes={{
              root: "accordionSummary-root",
              content: "accordionSummary-content",
              expanded: "accordionSummary-expanded",
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
          </AccordionSummary>
          <AccordionDetails classes={{ root: "accordionDetails-root" }}>
            <TimeReport routeId={`${id.toUpperCase()}`} seq={idx} />
            <div style={{ display: "flex" }}>
              <IconButton
                aria-label="share"
                onClick={onClickShare}
                style={{ backgroundColor: "transparent" }}
              >
                <ShareIcon />
              </IconButton>
              <IconButton
                aria-label="favourite"
                onClick={() => updateSavedEtas(`${id.toUpperCase()}/${idx}`)}
                style={{ backgroundColor: "transparent" }}
              >
                {savedEtas.includes(`${id.toUpperCase()}/${idx}`) ? (
                  <StarIcon />
                ) : (
                  <StarBorderIcon />
                )}
              </IconButton>
            </div>
          </AccordionDetails>
        </Accordion>
      );
    });
  }, [
    AppTitle,
    dest,
    expanded,
    fares,
    faresHoliday,
    handleChange,
    i18n.language,
    id,
    route,
    savedEtas,
    stopIdx,
    stopListExtracted,
    t,
    updateSavedEtas,
  ]);
  return (
    <Box
      className={
        !energyMode
          ? "stopAccordions-boxContainer"
          : "stopAccordions-boxContainer-energy"
      }
    >
      {stopListElements}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isCopied}
        autoHideDuration={1500}
        onClose={() => {
          setIsCopied(false);
        }}
        message={t("鏈結已複製到剪貼簿")}
      />
    </Box>
  );
};

export default StopAccordions;

const useStyles = makeStyles((theme) => ({
  "@global": {
    ".accordion-root": {
      border: "1px solid rgba(0, 0, 0, .125)",
      boxShadow: "none",
    },
    ".accordion-root:not(:last-child)": {
      borderBottom: 0,
    },
    ".accordion-root:before": {
      display: "none",
    },
    ".accordion-root.accordion-expanded": {
      margin: "auto",
    },
    ".accordionSummary-root": {
      backgroundColor:
        theme.palette.type === "dark"
          ? theme.palette.background.default
          : "rgba(0, 0, 0, .03)",
      borderBottom: "1px solid rgba(0, 0, 0, .125)",
      marginBottom: -1,
      minHeight: 44,
    },
    ".accordionSummary-root.accordionSummary-expanded": {
      minHeight: 44,
    },
    ".accordionSummary-content": {
      margin: "8px 0",
      flexDirection: "column",
    },
    ".accordionSummary-content.accordionSummary-expanded": {
      margin: "8px 0",
    },
    ".accordionDetails-root": {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      justifyContent: "space-between",
    },
    ".stopAccordions-boxContainer": {
      overflowY: "scroll",
      height: "calc(100vh - 30vh - 47px)",
    },
    ".stopAccordions-boxContainer-energy": {
      overflowY: "scroll",
      height: "calc(100vh - 47px)",
    },
  },
}));
