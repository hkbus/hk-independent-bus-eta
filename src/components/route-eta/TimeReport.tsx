import React, { useContext } from "react";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { useEtas } from "../Etas";
import { LinearProgress } from "../Progress";

interface TimeReportProps {
  routeId: string;
  seq: number;
  containerSx?: SxProps<Theme>;
  showStopName?: boolean;
}

const TimeReport = ({
  routeId,
  seq,
  containerSx,
  showStopName = false,
}: TimeReportProps) => {
  const { t, i18n } = useTranslation();
  const {
    db: { routeList, stopList },
    etaFormat,
  } = useContext(AppContext);
  const etas = useEtas(`${routeId}/${seq}`);

  if (etas == null) {
    return (
      <Box sx={containerSx}>
        <LinearProgress />
      </Box>
    );
  }

  const DisplayMsg = (eta) => {
    if (!eta) return "";
    else {
      const waitTime = Math.round(
        (new Date(eta).getTime() - new Date().getTime()) / 60 / 1000
      );

      if (!Number.isInteger(waitTime)) {
        return eta.remark[i18n.language];
      }

      const exactTimeJsx = (
        <Box
          component="span"
          sx={etaFormat !== "exact" ? { fontSize: "0.9em" } : {}}
        >
          {eta.substr(11, 5)}
        </Box>
      );
      const waitTimeJsx = (
        <Box component="span">
          <Box
            component="span"
            sx={{ ...waitTimeSx, color: (theme) => theme.palette.warning.main }}
          >
            {waitTime < 1 ? " - " : `${waitTime} `}
          </Box>
          <Box component="span" sx={{ fontSize: "0.8em" }}>
            {t("分鐘")}
          </Box>
        </Box>
      );

      switch (etaFormat) {
        case "exact":
          return exactTimeJsx;
        case "diff":
          return waitTimeJsx;
        default:
          return (
            <>
              {exactTimeJsx}&emsp;{waitTimeJsx}
            </>
          );
      }
    }
  };
  const stopId = Object.values(routeList[routeId].stops)[0][seq];

  return (
    <Box sx={containerSx}>
      {showStopName ? (
        <Typography variant="caption">
          {stopList[stopId].name[i18n.language]}
        </Typography>
      ) : null}
      {etas.length === 0
        ? t("未有班次資料")
        : etas.map((eta, idx) => (
            <Typography variant="subtitle1" key={`route-${idx}`}>
              {DisplayMsg(eta.eta)}&emsp;-&nbsp;
              <Box component="span" sx={{ fontSize: "0.8em" }}>
                {eta.remark[i18n.language] ? eta.remark[i18n.language] : ""}{" "}
                {t(eta.co)}
              </Box>
            </Typography>
          ))}
    </Box>
  );
};

export default TimeReport;

const waitTimeSx: SxProps<Theme> = {
  fontWeight: "700",
  color: "#088bce",
};
