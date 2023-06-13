import React, { useContext } from "react";
import { ListItemText, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEtas } from "../Etas";
import AppContext from "../../AppContext";
import { Eta } from "hk-bus-eta";

const SuccinctEtas = ({ routeId }) => {
  const { t, i18n } = useTranslation();
  const { etaFormat } = useContext(AppContext);
  const etas = useEtas(routeId);

  const getEtaString = (eta: Eta | null) => {
    if (!eta || !eta.eta) {
      return "";
    } else {
      const waitTime = Math.round(
        (new Date(eta.eta).getTime() - new Date().getTime()) / 60 / 1000
      );
      if (!Number.isInteger(waitTime)) {
        return eta.remark[i18n.language];
      }

      const exactTimeStr = eta.eta.slice(11, 16);
      const waitTimeStr =
        waitTime < 1 ? `- ${t("分鐘")}` : `${waitTime} ${t("分鐘")}`;
      switch (etaFormat) {
        case "exact":
          return exactTimeStr;
        case "diff":
          return waitTimeStr;
        default:
          return `${exactTimeStr} (${waitTimeStr})`;
      }
    }
  };

  return (
    <ListItemText
      primary={
        <Typography
          component="h5"
          color="textPrimary"
          sx={{ whiteSpace: "nowrap" }}
        >
          {etas ? getEtaString(etas[0]) : ""}
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

const secondarySx: SxProps<Theme> = {
  fontSize: "0.875rem",
  fontWeight: "400",
  lineHeight: "1.43",
  whiteSpace: "nowrap",
  textAlign: "right",
};
