import { useContext } from "react";
import { Box, Paper, SxProps, Theme, Typography } from "@mui/material";
import RouteNo from "../route-board/RouteNo";
import { toProperCase } from "../../utils";
import { useTranslation } from "react-i18next";
import ReverseButton from "./ReverseButton";
import TimetableButton from "./TimeTableButton";
import RouteStarButton from "./RouteStarButton";
import useLanguage from "../../hooks/useTranslation";
import DbContext from "../../context/DbContext";

const RouteHeader = ({ routeId }: { routeId: string }) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const {
    db: { routeList },
  } = useContext(DbContext);
  const { route, orig, dest, nlbId } = routeList[routeId];

  return (
    <Paper id="route-eta-header" sx={PaperSx} elevation={0}>
      <RouteNo routeNo={t(route)} component="h1" align="center" />
      <Typography component="h2" variant="caption" align="center">
        {t("往")} {toProperCase(dest[language])}{" "}
        {nlbId ? t("由") + " " + toProperCase(orig[language]) : ""}
      </Typography>
      <ReverseButton routeId={routeId} />
      <Box sx={rightBtnGroupSx}>
        <RouteStarButton routeId={routeId} />
        <TimetableButton routeId={routeId} />
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

const rightBtnGroupSx: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  right: "2%",
};
