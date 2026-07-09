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
import { getJoyYouFare, toProperCase, triggerShare } from "../../utils";
import TimeReport from "./TimeReport";
import ReactNativeContext from "../../context/ReactNativeContext";
import useLanguage from "../../hooks/useTranslation";
import DbContext from "../../context/DbContext";
import CollectionContext from "../../CollectionContext";
import PinnedEtasContext from "../../context/PinnedEtasContext";
import { useParams } from "react-router-dom";

interface StopAccordionProps {
  routeId: string;
  stopId: string;
  stopIdx: number;
  idx: number;
  onShareClick: () => void;
  onStopInfoClick: () => void;
  onSummaryClick: (idx: number, expand: boolean) => void;
}

const StopAccordion = React.forwardRef<HTMLDivElement, StopAccordionProps>(
  (props, ref) => {
    const { id: routeUri } = useParams();
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
      AppTitle,
      db: { routeList, stopList },
    } = useContext(DbContext);
    const { savedEtas, setCollectionDrawerRoute, collections } =
      useContext(CollectionContext);
    const { alarmStopId, toggleStopAlarm } = useContext(ReactNativeContext);
    const { isStopAlarm } = useContext(ReactNativeContext);
    const { pinnedEtas, togglePinnedEta } = useContext(PinnedEtasContext);
    const { t } = useTranslation();
    const language = useLanguage();
    const { route, co, fares, faresHoliday, dest } = routeList[routeId];
    const stop = stopList[stopId];
    const stopName = toProperCase(stop.name[language]);
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
    const joyYouFare = useMemo<string>(
      () => getJoyYouFare(route, co, fares, idx),
      [co, fares, idx, route]
    );

    const handleShareClick = useCallback(() => {
      triggerShare(
        `https://${window.location.hostname}/${language}/route/${routeUri}/${stopId}%2C${idx}`,
        `${idx + 1}. ${toProperCase(stop.name[language])} - ${route} ${t(
          "往"
        )} ${toProperCase(dest[language])} - ${t(AppTitle)}`
      ).then(() => {
        if (navigator.clipboard) {
          onShareClick();
        }
      });
    }, [
      language,
      routeUri,
      stopId,
      idx,
      stop.name,
      route,
      t,
      dest,
      AppTitle,
      onShareClick,
    ]);

    const handleChangeInner = useCallback(
      (_: unknown, expand: boolean) => {
        onSummaryClick(idx, expand);
      },
      [idx, onSummaryClick]
    );

    // Fares can differ per stop (section fares), so keep every value — just
    // present them compactly and surface the holiday fare only when it
    // actually differs from the regular one.
    const regularFare = fares && fares[idx] ? fares[idx] : "";
    const holidayFare =
      faresHoliday && faresHoliday[idx] ? faresHoliday[idx] : "";
    const showHolidayFare = holidayFare !== "" && holidayFare !== regularFare;

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
          <Typography component="h3" variant="body1" sx={stopNameSx}>
            {idx + 1}. {toProperCase(stop.name[language])}
          </Typography>
          {(regularFare || showHolidayFare || joyYouFare) && (
            <Typography variant="body2" sx={fareSx}>
              {regularFare && `$${regularFare}`}
              {showHolidayFare && ` ${t("假日")} $${holidayFare}`}
              {joyYouFare && ` ${t("樂悠")} $${joyYouFare}`}
            </Typography>
          )}
        </AccordionSummary>
        <AccordionDetails sx={accordionDetailsRootSx}>
          <TimeReport
            containerSx={accordionTimeReportSx}
            routeId={`${routeId.toUpperCase()}`}
            seq={idx}
            announce
          />
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Box>
              {isStopAlarm && (
                <IconButton
                  aria-label={`${t("到站提示")} - ${stopName}`}
                  aria-pressed={alarmStopId === stopId}
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
                aria-label={`${t("車站資訊")} - ${stopName}`}
                onClick={onStopInfoClick}
                style={{ background: "transparent" }}
                size="large"
              >
                <InfoIcon />
              </IconButton>
              <IconButton
                aria-label={`${t("置頂")} - ${stopName}`}
                aria-pressed={pinnedEtas.includes(targetRouteId)}
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
                aria-label={`${t("分享")} - ${stopName}`}
                onClick={handleShareClick}
                style={{ backgroundColor: "transparent" }}
                size="large"
              >
                <ShareIcon />
              </IconButton>
              <IconButton
                aria-label={`${t("收藏")} - ${stopName}`}
                aria-pressed={isStarred}
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
    minHeight: 60,
  },
  // Keep the previous 60px height even though the content is now one line —
  // a smaller row would be harder for elderly users to tap.
  minHeight: 60,
  "& .MuiAccordionSummary-content": {
    margin: "8px 0",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 1,
    "&.Mui-expanded": {
      margin: "8px 0",
    },
  },
};

const stopNameSx: SxProps<Theme> = {
  fontWeight: 700,
  flex: 1,
  minWidth: 0,
};

const fareSx: SxProps<Theme> = {
  flexShrink: 0,
  whiteSpace: "nowrap",
  color: (theme) => theme.palette.text.secondary,
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
