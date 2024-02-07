import { useContext } from "react";
import { Divider, Grid, SxProps, Theme, Typography } from "@mui/material";
import RouteNo from "../route-board/RouteNo";
import { toProperCase } from "../../utils";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import ReverseButton from "./ReverseButton";
import TimetableButton from "./TimeTableButton";
import RouteStarButton from "./RouteStarButton";
import InfoButton from "./InfoButton";

const RouteHeader = ({ routeId }: { routeId: string }) => {
  const { t, i18n } = useTranslation();
  const {
    db: { routeList },
  } = useContext(AppContext);
  const { route, orig, dest, nlbId } = routeList[routeId];

  return (
    <Grid container id="route-eta-header">
      <Grid item xs="auto" sx={btnGroupSx}>
        <ReverseButton routeId={routeId} />
        <Divider orientation="vertical" />
      </Grid>
      <Grid item xs>
        <RouteNo routeNo={route} component="h1" align="center" />
        <Typography component="h2" variant="caption" align="center">
          {t("往")} {toProperCase(dest[i18n.language])}{" "}
          {nlbId ? t("由") + " " + toProperCase(orig[i18n.language]) : ""}
        </Typography>
      </Grid>
      <Grid item xs="auto" sx={btnGroupSx}>
        <RouteStarButton routeId={routeId} />
        <Divider orientation="vertical" />
        <InfoButton routeId={routeId} />
        <TimetableButton routeId={routeId} />
      </Grid>
    </Grid>
  );
};

export default RouteHeader;

const btnGroupSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
};
