import React, { useContext } from "react";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { useEtas } from "../../hooks/useEtas";
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
  const {
    t,
    i18n: { language },
  } = useTranslation();
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
        return eta.remark[language];
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
          {stopList[stopId].name[language]}
        </Typography>
      ) : null}
      {etas.length === 0
        ? t("未有班次資料")
        : etas.map((eta, idx) => (
            <Typography variant="subtitle1" key={`route-${idx}`}>
              {DisplayMsg(eta.eta)}&emsp;-&nbsp;
              <Box component="span" sx={{ fontSize: "0.8em" }}>
                {getRemark(
                  eta.remark[language] ? eta.remark[language] : "",
                  language
                )}
                &emsp;
                {t(eta.co)}
              </Box>
            </Typography>
          ))}
    </Box>
  );
};

const getRemark = (remark: string, language: string) => {
  if (language === "zh") {
    return remark.replace(/▭▭/g, "雙卡").replace(/▭/g, "單卡");
  } else {
    return remark.replace(/▭▭/g, "Duel").replace(/▭/g, "Single");
  }
};

export default TimeReport;

const waitTimeSx: SxProps<Theme> = {
  fontWeight: "700",
  color: "#088bce",
};
