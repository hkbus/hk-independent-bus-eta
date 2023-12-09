import React, { useContext, useMemo } from "react";
import { Box, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { useEtas } from "../../hooks/useEtas";
import { LinearProgress } from "../Progress";
import { Eta, Terminal } from "hk-bus-eta";
import CallSplitIcon from "@mui/icons-material/CallSplit";

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
  } = useContext(AppContext);
  const etas = useEtas(`${routeId}/${seq}`);

  const stopId = Object.values(routeList[routeId].stops)[0][seq];
  const routeDest = routeList[routeId].dest;

  if (etas == null) {
    return (
      <Box sx={containerSx}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={containerSx}>
      {showStopName && (
        <Typography variant="caption">
          {stopList[stopId].name[language]}
        </Typography>
      )}
      {etas.length === 0 && t("未有班次資料")}
      {etas.length > 0 &&
        etas.map((eta, idx) => (
          <EtaLine key={`route-${idx}`} eta={eta} routeDest={routeDest} />
        ))}
    </Box>
  );
};

interface EtaMsgProps {
  eta: Eta;
  routeDest: Terminal;
}

const EtaLine = ({
  eta: { eta, remark, co, dest },
  routeDest,
}: EtaMsgProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { etaFormat } = useContext(AppContext);

  const branchRoute = useMemo(() => {
    if (routeDest.en.toLowerCase() === dest.en.toLowerCase()) {
      return false;
    }
    if (routeDest.zh === dest.zh) {
      return false;
    }
    return true;
  }, [routeDest, dest]);

  const waitTime = Math.round(
    (new Date(eta).getTime() - new Date().getTime()) / 60 / 1000
  );

  const exactTimeJsx = (
    <Box
      component="span"
      sx={etaFormat !== "exact" ? { fontSize: "0.9em" } : {}}
    >
      {eta.slice(11, 16)}
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

  return (
    <Typography variant="subtitle1">
      {etaFormat === "diff" && waitTimeJsx}
      {etaFormat === "exact" && exactTimeJsx}
      {etaFormat === "mixed" && (
        <>
          {exactTimeJsx}&emsp;{waitTimeJsx}
        </>
      )}
      &emsp;-&nbsp;
      <Box
        component="span"
        sx={{ fontSize: "0.8em", textOverflow: "ellipsis" }}
      >
        {getRemark(remark[language] ? remark[language] : "", language)}
        &emsp;
        {t(co)}
        {branchRoute && dest[language] && (
          <>
            &emsp;
            <Tooltip
              title={dest[language]}
              placement="top"
              arrow={true}
              enterTouchDelay={200}
              leaveTouchDelay={200}
            >
              <CallSplitIcon
                sx={{ transform: "rotate(90deg)", fontSize: "1em" }}
              />
            </Tooltip>
            &emsp;
            {dest[language]}
          </>
        )}
      </Box>
    </Typography>
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
