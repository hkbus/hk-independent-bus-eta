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
  Directions as DirectionsIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import AppContext from "../../AppContext";
import { useTranslation } from "react-i18next";
import { toProperCase } from "../../utils";
import TimeReport from "./TimeReport";
import ShareIcon from "@mui/icons-material/Share";
import { SharingModalProps } from "./SharingModal";
import ReactNativeContext from "../../ReactNativeContext";

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
      savedEtas,
      setCollectionDrawerRoute,
      collections,
    } = useContext(AppContext);
    const { alarmStopId, toggleStopAlarm } = useContext(ReactNativeContext);
    const { os } = useContext(ReactNativeContext);
    const { t, i18n } = useTranslation();
    const { fares, faresHoliday } = routeList[routeId];
    const stop = stopList[stopId];
    const isStarred = useMemo<boolean>(
      () =>
        savedEtas.includes(`${routeId.toUpperCase()}/${idx}`) ||
        collections.reduce(
          (acc, cur) =>
            acc || cur.list.includes(`${routeId.toUpperCase()}/${idx}`),
          false
        ),
      [savedEtas, collections, routeId, idx]
    );

    const handleShareClick = useCallback(
      (e) => {
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

    const onClickDirection = useCallback(() => {
      const { lat, lng } = stop.location;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
      );
    }, [stop.location]);

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
            routeId={`${routeId.toUpperCase()}`}
            seq={idx}
          />
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Box>
              {os && (
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
                aria-label="direction"
                onClick={onClickDirection}
                style={{ background: "transparent" }}
                size="large"
              >
                <DirectionsIcon />
              </IconButton>
              <IconButton
                aria-label="stop-info"
                onClick={onStopInfoClick}
                style={{ background: "transparent" }}
                size="large"
              >
                <InfoIcon />
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
                  const targetRouteId = `${routeId.toUpperCase()}/${idx}`;
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
