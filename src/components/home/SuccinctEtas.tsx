import React, { useContext } from "react";
import { Box, ListItemText, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEtas } from "../Etas";
import AppContext from "../../AppContext";
import { Eta } from "hk-bus-eta";

const SuccinctEtas = ({ routeId }) => {
  const { t, i18n } = useTranslation();
  const { etaFormat } = useContext(AppContext);
  const etas = useEtas(routeId);

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

      const exactTimeJsx = (
        <Box
          component="span"
          sx={etaFormat !== "exact" ? { fontSize: "0.9em" } : {}}
        >
          {eta.eta.slice(11, 16)}
        </Box>
      );
      const waitTimeJsx = (
        <Box component="span">
          <Box
            component="span"
            sx={{
              ...waitTimeSx,
              color: (theme) =>
                highlight ? theme.palette.warning.main : "inherit",
            }}
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
