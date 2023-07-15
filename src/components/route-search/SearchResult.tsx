import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemText,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
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
    <Accordion
      TransitionProps={{ unmountOnExit: true }}
      sx={rootSx}
      onChange={() => handleRouteClick(idx)}
      expanded={expanded}
    >
      <AccordionSummary sx={summaryRootSx}>
        <ListItemText
          primary={routes.map((selectedRoute, routeIdx) => {
            const { routeId } = selectedRoute;
            const { route, serviceType } = routeList[routeId];

            return (
              <span key={`search-${idx}-${routeIdx}`}>
                <RouteNo routeNo={route} />
                {parseInt(serviceType, 10) >= 2 && (
                  <Typography variant="caption">{t("特別班")}</Typography>
                )}
              </span>
            );
          })}
          secondary={getStopString(routes)}
          sx={listItemTextSx}
        />
      </AccordionSummary>
      <AccordionDetails sx={detailsSx}>
        {routes.map((selectedRoute, routeIdx) => (
          <TimeReport
            key={`timereport-${idx}-${routeIdx}`}
            routeId={selectedRoute.routeId.toUpperCase()}
            seq={selectedRoute.on + (stopIdx ? stopIdx[routeIdx] : 0)}
            containerSx={timeReportSx}
            showStopName={true}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default SearchResult;

const rootSx: SxProps<Theme> = {
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

const summaryRootSx: SxProps<Theme> = {
  backgroundColor: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : "rgba(0, 0, 0, .03)",
  borderBottom: "1px solid rgba(0, 0, 0, .125)",
  marginBottom: -1,
  minHeight: 44,
  "&.Mui-expanded": {
    minHeight: 44,
  },
  "& .MuiAccordionSummary-content": {
    margin: "8px 0",
    flexDirection: "column",
    [`&.Mui-expanded`]: {
      margin: "8px 0",
    },
  },
};

const detailsSx: SxProps<Theme> = {
  px: (theme) => theme.spacing(2),
  py: (theme) => theme.spacing(1),
  display: "flex",
};

const timeReportSx: SxProps<Theme> = {
  width: "50%",
};

const listItemTextSx: SxProps<Theme> = {
  "& .MuiListItemText-primary > span": {
    width: "50%",
    display: "inline-block",
    "& > span": {
      fontSize: "0.6rem",
      marginLeft: "8px",
    },
  },
};
