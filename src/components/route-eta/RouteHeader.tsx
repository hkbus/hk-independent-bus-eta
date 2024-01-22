import React, { useContext } from "react";
import { Box, Divider, Paper, SxProps, Theme, Typography } from "@mui/material";
import RouteNo from "../route-board/RouteNo";
import { toProperCase } from "../../utils";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import ReverseButton from "./ReverseButton";
import TimetableButton from "./TimeTableButton";
import RouteStarButton from "./RouteStarButton";
import RouteWatchButton from "./RouteWatchButton";

const RouteHeader = ({ routeId }: { routeId: string }) => {
  const { t, i18n } = useTranslation();
  const {
    db: { routeList },
  } = useContext(AppContext);
  const { route, orig, dest, nlbId } = routeList[routeId];

  return (
    <Paper id="route-eta-header" sx={PaperSx} elevation={0}>
      <Box sx={leftInfoGroupSx}>
        <RouteNo routeNo={route} component="h1" align="left" />
        <Typography component="h1" fontSize="min(1em, calc(100vw / 29))" align="left" lineHeight="1.25em">
          {t("往")} {toProperCase(dest[i18n.language])}{" "}
          {nlbId ? t("由") + " " + toProperCase(orig[i18n.language]) : ""}
        </Typography>
      </Box>
      <Box sx={rightBtnGroupSx}>
        <Box sx={rightButtonContainerSx}>
          <RouteWatchButton routeId={routeId} />
          <Divider orientation="vertical" sx={buttonDividerSx} />
          <RouteStarButton routeId={routeId} />
          <Divider orientation="vertical" sx={buttonDividerSx} />
          <ReverseButton routeId={routeId} />
          <Divider orientation="vertical" sx={buttonDividerSx} />
          <TimetableButton routeId={routeId} />
        </Box>
      </Box>
    </Paper>
  );
};

export default RouteHeader;

const PaperSx: SxProps<Theme> = {
  textAlign: "center",
  background: "transparent",
  position: "relative",
};

const buttonDividerSx: SxProps<Theme> = {
  top: "0",
  left: "calc(64px + 2%)",
};

const leftInfoGroupSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'last baseline',
  textAlign: "left",
  background: "transparent",
  position: "relative",
  height: "50px",
  gap: "5px",
  transform: "translateY(-10%)",
  left: "2%",
  maxWidth: "calc(100% - 202px)",
};

const rightBtnGroupSx: SxProps<Theme> = {
  position: "absolute",
  top: "0",
  right: "0%",
};

const rightButtonContainerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  textAlign: "right",
  background: "transparent",
  position: "relative",
  height: "50px",
};
