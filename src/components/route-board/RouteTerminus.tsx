import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { toProperCase } from "../../utils";
import AppContext from "../../AppContext";

const RouteTerminus = ({ terminus }) => {
  const { t, i18n } = useTranslation();
  const {
    db: { routeList, stopList }
  } = useContext(AppContext);
  const { bound, route, stops, co, gtfsId, dest, orig } = terminus;

  const firstLastDiff = (arr) => {
    if (arr.length < 2) return arr;
    return [arr[0], arr[arr.length - 1]];
  };

  var remark = terminus.serviceType >= 2 ? (t("從") + orig[i18n.language] + t("開出")) : "";
  if (terminus.nlbId) {
    remark = t("從") + toProperCase(terminus.orig[i18n.language]) + t("開出");
  } else if (terminus.serviceType >= 2) {
    for (let [, data] of Object.entries(routeList)) {
      if (Number(data.serviceType) === 1 && 
        route === data.route && 
        JSON.stringify(bound) === JSON.stringify(data.bound) && 
        (co[0] === "gmb" ? gtfsId === data.gtfsId : JSON.stringify(co) === JSON.stringify(data.co))) 
      {
        if (data.dest.zh !== dest.zh) {
          remark = t("開往") + dest[i18n.language];
        } else if (data.orig.zh !== orig.zh) {
          remark = t("從") + orig[i18n.language] + t("開出");
        } else {
          let mainRouteFirstStop = stopList[data.stops[co][0]].name;
          let mainRouteLastStop = stopList[data.stops[co][data.stops[co].length - 1]].name;
          let routeFirstStop = stopList[stops[co][0]].name;
          let routeLastStop = stopList[stops[co][stops[co].length - 1]].name;

          if (mainRouteLastStop.zh !== routeLastStop.zh) {
            remark = t("開往") + routeLastStop[i18n.language];
          } else if (mainRouteFirstStop.zh !== routeFirstStop.zh) {
            remark = t("從") + routeFirstStop[i18n.language] + t("開出");
          } else {
            let difference = stops[co]
              .filter(x => !data.stops[co].includes(x))
              .map(x => stopList[x].name[i18n.language]);
            if (difference.length > 0) {
              remark = t("經") + firstLastDiff(difference).join(t("至"));
            } else {
              difference = data.stops[co]
                .filter(x => !stops[co].includes(x))
                .map(x => stopList[x].name[i18n.language]);
              if (difference.length > 0) {
                remark = t("不經") + firstLastDiff(difference).join(t("至"));
              }
            }
          }
        }
        break;
      }
    } 
  }

  return (
    <Box sx={rootSx}>
      <Box sx={fromToWrapperSx}>
        <span>{`${t("往")} `}</span>
        <Typography component="h3" variant="h6" sx={destinationSx} textOverflow="ellipsis" overflow="hidden">
          {toProperCase(terminus.dest[i18n.language])}
        </Typography>
      </Box>
      <Box sx={fromWrapperSx}>
        <Typography variant="body2" textOverflow="ellipsis" overflow="hidden">
          {remark}
        </Typography>
      </Box>
    </Box>
  );
};

export default RouteTerminus;

const rootSx: SxProps<Theme> = {
  textAlign: "left",
  "& > span": {},
};

const fromToWrapperSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  whiteSpace: "nowrap",
  overflowX: "hidden",
  "& > span": {
    fontSize: "0.95em",
    mr: 0.5,
  },
};

const fromWrapperSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  whiteSpace: "nowrap",
  overflowX: "hidden",
};

const destinationSx: SxProps<Theme> = {
  fontWeight: 700,
};
