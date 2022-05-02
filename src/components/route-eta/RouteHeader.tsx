import React, { useContext } from "react";
import { Paper, SxProps, Theme, Typography } from "@mui/material";
import RouteNo from "../route-board/RouteNo";
import { toProperCase } from "../../utils";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import ReverseButton from "./ReverseButton";
import TimetableButton from "./TimeTableButton";

const RouteHeader = ({ routeId }: { routeId: string }) => {
  const { t, i18n } = useTranslation();
  const {
    db: { routeList },
  } = useContext(AppContext);
  const { route, orig, dest, nlbId } = routeList[routeId];

  return (
    <Paper id="route-eta-header" sx={PaperSx} elevation={0}>
      <RouteNo routeNo={route} component="h1" align="center" />
      <Typography component="h2" variant="caption" align="center">
        {t("往")} {toProperCase(dest[i18n.language])}{" "}
        {nlbId ? t("由") + " " + toProperCase(orig[i18n.language]) : ""}
      </Typography>
      <ReverseButton routeId={routeId} />
      <TimetableButton routeId={routeId} />
    </Paper>
  );
};

export default RouteHeader;

const PaperSx: SxProps<Theme> = {
  textAlign: "center",
  background: "transparent",
  position: "relative",
};
