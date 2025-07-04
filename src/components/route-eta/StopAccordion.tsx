import React, { useContext, useCallback, useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  IconButton,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import {
  NotificationAdd as NotificationAddIcon,
  NotificationsOff as NotificationsOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Info as InfoIcon,
  Share as ShareIcon,
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { toProperCase } from "../../utils";
import TimeReport from "./TimeReport";
import { SharingModalProps } from "./SharingModal";
import ReactNativeContext from "../../context/ReactNativeContext";
import useLanguage from "../../hooks/useTranslation";
import DbContext from "../../context/DbContext";
import CollectionContext from "../../CollectionContext";
import PinnedEtasContext from "../../context/PinnedEtasContext";

interface StopAccordionProps {
  routeId: string;
  stopId: string;
  stopIdx: number;
  idx: number;
  onShareClick: (obj: SharingModalProps) => void;
  onStopInfoClick: () => void;
  onSummaryClick: (idx: number, expand: boolean) => void;
}

const StopAccordion = React.forwardRef<HTMLDivElement, StopAccordionProps>(
  (props, ref) => {
    const {
      routeId,
      stopId,
      stopIdx,
      idx,
      onShareClick,
      onSummaryClick,
      onStopInfoClick,
    } = props;
    const {
      db: { routeList, stopList },
    } = useContext(DbContext);
    const { savedEtas, setCollectionDrawerRoute, collections } =
      useContext(CollectionContext);
    const { alarmStopId, toggleStopAlarm } = useContext(ReactNativeContext);
    const { isStopAlarm } = useContext(ReactNativeContext);
    const { pinnedEtas, togglePinnedEta } = useContext(PinnedEtasContext);
    const { t } = useTranslation();
    const language = useLanguage();
    const { fares, faresHoliday } = routeList[routeId];
    const stop = stopList[stopId];
    const targetRouteId = `${routeId.toUpperCase()}/${idx}`;
    const isStarred = useMemo<boolean>(
      () =>
        savedEtas.includes(targetRouteId) ||
        collections.reduce(
          (acc, cur) => acc || cur.list.includes(targetRouteId),
          false
        ),
      [savedEtas, targetRouteId, collections]
    );

    const handleShareClick = useCallback(
      (e: React.MouseEvent) => {
        onShareClick({
          routeId,
          seq: idx,
          stopId,
          event: e,
        });
      },
      [onShareClick, routeId, idx, stopId]
    );

    const handleChangeInner = useCallback(
      (_: unknown, expand: boolean) => {
        onSummaryClick(idx, expand);
      },
      [idx, onSummaryClick]
    );

    return (
      <Accordion
        id={`stop-${idx}`}
        expanded={stopIdx === idx && navigator.userAgent !== "prerendering"}
        onChange={handleChangeInner}
        TransitionProps={{ unmountOnExit: true }}
        ref={ref}
        sx={accordionSx}
      >
        <AccordionSummary sx={accordionSummarySx}>
          <Typography component="h3" variant="body1" sx={{ fontWeight: 700 }}>
            {idx + 1}. {toProperCase(stop.name[language])}
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
            routeId={`${routeId.toUpperCase()}`}
            seq={idx}
          />
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Box>
              {isStopAlarm && (
                <IconButton
                  aria-label="alert"
                  onClick={() => toggleStopAlarm(stopId)}
                  style={{ backgroundColor: "transparent" }}
                  size="large"
                >
                  {alarmStopId === stopId ? (
                    <NotificationsOffIcon />
                  ) : (
                    <NotificationAddIcon />
                  )}
                </IconButton>
              )}
              <IconButton
                aria-label="stop-info"
                onClick={onStopInfoClick}
                style={{ background: "transparent" }}
                size="large"
              >
                <InfoIcon />
              </IconButton>
              <IconButton
                aria-label="pin"
                onClick={() => togglePinnedEta(targetRouteId)}
                style={{ backgroundColor: "transparent" }}
                size="large"
              >
                {pinnedEtas.includes(targetRouteId) ? (
                  <PushPinIcon />
                ) : (
                  <PushPinOutlinedIcon />
                )}
              </IconButton>
            </Box>
            <Box>
              <IconButton
                aria-label="share"
                onClick={handleShareClick}
                style={{ backgroundColor: "transparent" }}
                size="large"
              >
                <ShareIcon />
              </IconButton>
              <IconButton
                aria-label="favourite"
                onClick={() => {
                  setCollectionDrawerRoute(targetRouteId);
                }}
                style={{ backgroundColor: "transparent" }}
                size="large"
              >
                {isStarred ? <StarIcon sx={starSx} /> : <StarBorderIcon />}
              </IconButton>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  }
);

export default StopAccordion;

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

const starSx: SxProps<Theme> = {
  color: (t) =>
    t.palette.mode === "dark" ? t.palette.primary.main : "inherit",
};
