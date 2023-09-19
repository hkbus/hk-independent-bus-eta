import React, { useContext } from "react";
import { Box, ListItemText, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEtas } from "../../hooks/useEtas";
import AppContext from "../../AppContext";
import { Eta } from "hk-bus-eta";
import { Schedule as ScheduleIcon } from "@mui/icons-material";

interface SuccinctEtasProps {
  routeId?: string;
  value?: Eta[];
}

const SuccinctEtas = ({ routeId, value = undefined }: SuccinctEtasProps) => {
  const { t, i18n } = useTranslation();
  const { etaFormat, annotateScheduled } = useContext(AppContext);
  const _etas = useEtas(routeId, Boolean(value));
  const etas = value ?? _etas;

  const getEtaString = (eta: Eta | null, highlight: boolean = false) => {
    if (!eta || !eta.eta) {
      return "";
    } else {
      const waitTime = Math.round(
        (new Date(eta.eta).getTime() - new Date().getTime()) / 60 / 1000
      );
      if (!Number.isInteger(waitTime)) {
        return eta.remark[i18n.language];
      }

      const { remark } = eta;
      const isScheduled =
        remark?.zh?.endsWith("班次") || remark?.en?.endsWith("Scheduled Bus");
      const platform = parseInt(
        /Platform ([\d]+)/gm.exec(remark?.en ?? "")?.at(1) ?? "0",
        10
      );
      const trains =
        /Platform [\d+] - (▭+)/gm.exec(remark?.en ?? "")?.at(1) ?? "";

      const exactTimeJsx = (
        <Box
          component="span"
          sx={{ fontSize: etaFormat !== "exact" ? "0.9em" : "1rem" }}
        >
          {isScheduled && annotateScheduled && (
            <>
              <ScheduleIcon sx={{ fontSize: "0.9em" }} />
              &nbsp;
            </>
          )}
          {trains && (
            <Typography variant="caption" color="inherit">
              {`${trains} ${PLATFORM[platform]}`}&emsp;
            </Typography>
          )}
          {eta.eta.slice(11, 16)}
        </Box>
      );
      const waitTimeJsx = (
        <Box component="span">
          {etaFormat === "diff" && trains && (
            <Typography variant="caption" color="inherit">
              {`${trains} ${PLATFORM[platform]}`}&emsp;
            </Typography>
          )}
          <Box
            component="span"
            sx={{
              ...waitTimeSx,
              color: (theme) =>
                highlight ? theme.palette.warning.main : "inherit",
            }}
          >
            {isScheduled && annotateScheduled && etaFormat === "diff" && (
              <>
                <ScheduleIcon color="inherit" sx={{ fontSize: "0.9rem" }} />
                &nbsp;
              </>
            )}
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

  return (
    <ListItemText
      primary={
        <Typography component="h5" color="textPrimary" sx={primarySx}>
          {etas ? getEtaString(etas[0], true) : ""}
        </Typography>
      }
      secondary={
        <Typography variant="h6" color="textSecondary" sx={secondarySx}>
          {etas ? getEtaString(etas[1]) : ""}
          <br />
          {etas ? getEtaString(etas[2]) : ""}
        </Typography>
      }
      sx={rootSx}
    />
  );
};

const PLATFORM = [" ", "①", "②", "③", "④", "⑤", "⑥", "⑦"];

export default SuccinctEtas;

const rootSx: SxProps<Theme> = {
  textAlign: "right",
};

const primarySx: SxProps<Theme> = {
  whiteSpace: "nowrap",
};

const secondarySx: SxProps<Theme> = {
  fontSize: "0.875rem !important",
  fontWeight: "400",
  lineHeight: "1.43",
  whiteSpace: "nowrap",
  textAlign: "right",
};

const waitTimeSx: SxProps<Theme> = {
  fontSize: "1.1em",
  fontWeight: "700",
  color: "#088bce",
};
