import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemText,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AppContext from "../../AppContext";
import RouteNo from "../route-board/RouteNo";
import TimeReport from "../route-eta/TimeReport";

const SearchResult = ({ routes, idx, handleRouteClick, expanded, stopIdx }) => {
  const {
    db: { routeList, stopList },
  } = useContext(AppContext);
  const { t, i18n } = useTranslation();

  const getStopString = (routes) => {
    const ret = [];
    routes.forEach((selectedRoute) => {
      const { routeId, on } = selectedRoute;
      const { fares, stops } = routeList[routeId];
      ret.push(
        stopList[
          Object.values(stops).sort((a, b) => b.length - a.length)[0][on]
        ].name[i18n.language] + (fares ? ` ($${fares[on]})` : "")
      );
    });
    const { routeId, off } = routes[routes.length - 1];
    const { stops } = routeList[routeId];
    return ret
      .concat(
        stopList[
          Object.values(stops).sort((a, b) => b.length - a.length)[0][off]
        ].name[i18n.language]
      )
      .join(" → ");
  };

  return (
    <ResultAccordion
      TransitionProps={{ unmountOnExit: true }}
      classes={{ root: classes.root, expanded: classes.expandedAccordion }}
      onChange={() => handleRouteClick(idx)}
      expanded={expanded}
    >
      <AccordionSummary
        classes={{
          root: classes.summaryRoot,
          content: classes.content,
          expanded: classes.summaryExpanded,
        }}
      >
        <ListItemText
          primary={routes.map((selectedRoute, routeIdx) => {
            const { routeId } = selectedRoute;
            const { route, serviceType } = routeList[routeId];

            return (
              <span
                className={classes.routeNo}
                key={`search-${idx}-${routeIdx}`}
              >
                <RouteNo routeNo={route} />
                {parseInt(serviceType, 10) >= 2 && (
                  <Typography variant="caption" className={classes.specialTrip}>
                    {t("特別班")}
                  </Typography>
                )}
              </span>
            );
          })}
          secondary={getStopString(routes)}
        />
      </AccordionSummary>
      <AccordionDetails classes={{ root: classes.details }}>
        {routes.map((selectedRoute, routeIdx) => (
          <TimeReport
            key={`timereport-${idx}-${routeIdx}`}
            routeId={selectedRoute.routeId.toUpperCase()}
            seq={selectedRoute.on + (stopIdx ? stopIdx[routeIdx] : 0)}
            containerClass={classes.timerReport}
            showStopName={true}
          />
        ))}
      </AccordionDetails>
    </ResultAccordion>
  );
};

export default SearchResult;

const PREFIX = "search-result";

const classes = {
  root: `${PREFIX}-root`,
  expandedAccordion: `${PREFIX}-expanded`,
  summaryRoot: `${PREFIX}-summary-root`,
  summaryExpanded: `${PREFIX}-summary-root-expanded`,
  content: `${PREFIX}-content`,
  details: `${PREFIX}-details`,
  timerReport: `${PREFIX}-timer-report`,
  routeNo: `${PREFIX}-route-no`,
  specialTrip: `${PREFIX}-special-trip`,
};

const ResultAccordion = styled(Accordion)(({ theme }) => ({
  [`&.${classes.root}`]: {
    border: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    [`&.${classes.expandedAccordion}`]: {
      margin: "auto",
    },
  },
  [`& .${classes.summaryRoot}`]: {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "rgba(0, 0, 0, .03)",
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    marginBottom: -1,
    minHeight: 44,
    [`&.${classes.summaryExpanded}`]: {
      minHeight: 44,
    },
  },
  [`& .${classes.content}`]: {
    margin: "8px 0",
    flexDirection: "column",
    [`&.${classes.summaryExpanded}`]: {
      margin: "8px 0",
    },
  },
  [`& .${classes.details}`]: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    display: "flex",
  },
  [`& .${classes.timerReport}`]: {
    width: "50%",
  },
  [`& .${classes.routeNo}`]: {
    width: "50%",
    display: "inline-block",
  },
  [`& .${classes.specialTrip}`]: {
    fontSize: "0.6rem",
    marginLeft: "8px",
  },
}));
