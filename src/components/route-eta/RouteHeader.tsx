import { useContext } from "react";
import { Box, Divider, Paper, SxProps, Theme, Typography } from "@mui/material";
import RouteNo from "../route-board/RouteNo";
import { toProperCase } from "../../utils";
import { useTranslation } from "react-i18next";
import ReverseButton from "./ReverseButton";
import TimetableButton from "./TimeTableButton";
import RouteStarButton from "./RouteStarButton";
import useLanguage from "../../hooks/useTranslation";
import DbContext from "../../context/DbContext";

interface RouteHeaderProps {
  routeId: string;
  stopId: string;
}

const RouteHeader = ({ routeId, stopId }: RouteHeaderProps) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const {
    db: { routeList },
  } = useContext(DbContext);
  const { route, orig, dest, nlbId } = routeList[routeId];

  return (
    <Paper id="route-eta-header" sx={PaperSx} elevation={0}>
      <ReverseButton routeId={routeId} stopId={stopId} />
      <Box sx={centerColumnSx}>
        <Box sx={routeNoRowSx}>
          <RouteNo routeNo={t(route)} component="h1" align="center" />
          <RouteStarButton routeId={routeId} />
        </Box>
        <Typography component="h2" variant="caption" align="center">
          {t("往")} {toProperCase(dest[language])}{" "}
          {nlbId ? t("由") + " " + toProperCase(orig[language]) : ""}
        </Typography>
      </Box>
      <Box sx={rightColumnSx}>
        <Divider orientation="vertical" flexItem />
        <TimetableButton routeId={routeId} />
      </Box>
    </Paper>
  );
};

export default RouteHeader;

const PaperSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "stretch",
  textAlign: "center",
  background: "transparent",
};

const centerColumnSx: SxProps<Theme> = {
  flex: 1,
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
};

const routeNoRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
};

const rightColumnSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
};
