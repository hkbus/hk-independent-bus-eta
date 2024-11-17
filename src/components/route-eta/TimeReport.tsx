import { useContext, useMemo } from "react";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../../context/AppContext";
import { useEtas } from "../../hooks/useEtas";
import { LinearProgress } from "../Progress";
import { Eta, Terminal } from "hk-bus-eta";
import { getPlatformSymbol, getLineColor } from "../../utils";
import useLanguage from "../../hooks/useTranslation";
import DbContext from "../../context/DbContext";
import { DoubleTrainIcon, SingleTrainIcon } from "../home/SuccinctEtas";

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
  const { t } = useTranslation();
  const language = useLanguage();
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);
  const etas = useEtas(`${routeId}/${seq}`);

  const { route, co, stops } = routeList[routeId];
  const stopId = Object.values(stops)[0][seq];
  const routeDests = useMemo(
    () =>
      Object.values(routeList[routeId].stops)
        .map((ids) => stopList[ids[ids.length - 1]].name)
        .concat(routeList[routeId].dest),
    [routeList, routeId, stopList]
  );

  const noScheduleRemark = useMemo(() => {
    let isEndOfTrainLine = false;
    if (co[0] === "mtr") {
      isEndOfTrainLine =
        stops["mtr"].indexOf(stopId) + 1 >= stops["mtr"].length;
    } else if (co.includes("lightRail")) {
      isEndOfTrainLine =
        stops["lightRail"].indexOf(stopId) + 1 >= stops["lightRail"].length;
    }

    if (etas === null) {
      return null;
    }

    if (isEndOfTrainLine && etas.length === 0) {
      return t("終點站");
    } else if (
      etas.length > 0 &&
      etas.every((e) => !e.eta) &&
      etas[0].remark[language]
    ) {
      return etas[0].remark[language];
    } else if (etas.length === 0 || etas.every((e) => !e.eta)) {
      return t("未有班次資料");
    }
    return null;
  }, [etas, co, stops, stopId, t, language]);

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
      {noScheduleRemark}
      {etas.length > 0 &&
        etas.every((e) => e.eta) &&
        etas.map((eta, idx) => (
          <EtaLine
            key={`route-${idx}`}
            eta={eta}
            routeDests={routeDests}
            showCompany={co.length > 1}
            route={route}
          />
        ))}
    </Box>
  );
};

interface EtaMsgProps {
  eta: Eta;
  routeDests: Terminal[];
  showCompany: boolean;
  route: string;
}

const EtaLine = ({
  eta: { eta, remark, co, dest },
  routeDests,
  showCompany,
  route,
}: EtaMsgProps) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const { etaFormat, platformMode } = useContext(AppContext);

  const branchRoute = useMemo(() => {
    if (co === "mtr") {
      return true;
    }
    for (const routeDest of routeDests) {
      if (routeDest.en.toLowerCase() === dest.en.toLowerCase()) {
        return false;
      }
      if (routeDest.zh === dest.zh) {
        return false;
      }
    }
    return true;
  }, [routeDests, dest, co]);

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

  const isTrain = co === "mtr" || co === "lightRail";

  let waitTimeText;
  let trainTextUsed;
  if (isTrain && waitTime <= 1) {
    waitTimeText = waitTime === 1 ? `${t("即將抵達")} ` : `${t("正在離開")} `;
    trainTextUsed = true;
  } else {
    waitTimeText = waitTime < 1 ? " - " : `${waitTime} `;
    trainTextUsed = false;
  }

  const waitTimeJsx = (
    <Box component="span">
      <Box
        component="span"
        sx={{ ...waitTimeSx, color: (theme) => theme.palette.warning.main }}
        fontSize={trainTextUsed ? "0.9em" : undefined}
      >
        {waitTimeText}
      </Box>
      {!trainTextUsed && (
        <Box component="span" sx={{ fontSize: "0.8em" }}>
          {t("分鐘")}
        </Box>
      )}
    </Box>
  );

  return (
    <Typography variant="subtitle1" sx={{ justifyContent: "center" }}>
      {etaFormat === "diff" && waitTimeJsx}
      {etaFormat === "exact" && exactTimeJsx}
      {etaFormat === "mixed" && (
        <>
          {exactTimeJsx}&emsp;{waitTimeJsx}
        </>
      )}
      {!isTrain && <>&emsp;-&nbsp;</>}
      <Box
        component="span"
        sx={{ fontSize: "0.8em", textOverflow: "ellipsis" }}
      >
        {showCompany && <>&emsp;{t(co)}</>}
        &emsp;
        <EtaRemark
          remark={remark}
          co={co}
          language={language}
          route={route}
          platformMode={platformMode}
        />
        {isTrain && " "}
        {!isTrain && <>&emsp;</>}
        {branchRoute && dest[language]}
      </Box>
    </Typography>
  );
};

interface EtaRemarkProps {
  remark: Eta["remark"];
  co: Eta["co"];
  route: string;
  platformMode: boolean;
  language: "zh" | "en";
}

const EtaRemark = ({
  remark,
  language,
  co,
  route,
  platformMode,
}: EtaRemarkProps) => {
  if (remark === null) return "";

  const isTrain = co === "mtr" || co === "lightRail";
  if (!isTrain) {
    return remark[language];
  }

  const parts: string[] = [];
  let ret = "";
  let trains = "";

  // the parser only works with en but zh can be used as fallback for display anyway
  (remark.en || remark[language]).split(" - ").forEach((part, i) => {
    // retrieve single digit numerical string from remark as a circle text
    const platform = [...(part.matchAll(/^Platform (\d+)$/g) ?? [])][0] || [];
    // replace only when single occurrence of single digit numerical string
    // if the remark has more than one occurrence of numerical string
    // or if the only numerical string occurrence are more than one digit, use original remark
    if (platform.length === 2 && platform[1].length) {
      // getPlatformSymbol only supports single digit number
      ret = getPlatformSymbol(Number(platform[1]), platformMode) ?? platform[1];
      return;
    }

    const trainsLocal = (/^▭+$/g.exec(part) ?? [])[0];
    if (trainsLocal) {
      trains = trainsLocal;
      return;
    }

    parts.push(remark[language].split(" - ")[i]);
  });

  return (
    <>
      <Box
        component="span"
        color={getLineColor([co], route, true)}
        sx={{ marginX: 0.25 }}
      >
        {ret}
      </Box>
      <Box component="span" sx={{ marginX: 0.25 }}>
        {trains.length === 1 && <SingleTrainIcon />}
        {trains.length === 2 && <DoubleTrainIcon />}
      </Box>
      {parts.map((part, i) => (
        <Box key={i} component="span" sx={{ marginX: 0.25 }}>
          {part}
        </Box>
      ))}
    </>
  );
};

export default TimeReport;

const waitTimeSx: SxProps<Theme> = {
  fontWeight: "700",
  color: "#088bce",
};
