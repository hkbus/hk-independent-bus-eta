import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { toProperCase } from "../../utils";

const RouteTerminus = ({ terminus }) => {
  const { t, i18n } = useTranslation();

  return (
    <StyledRouteTerminus>
      <Typography
        component="h3"
        variant="body1"
        className={classes.routeTerminus}
      >
        <div>
          <div className={classes.fromToWrapper}>
            <span className={classes.fromToText}>{`${t("往")} `}</span>
            <b>{toProperCase(terminus.dest[i18n.language])}</b>
          </div>
          <div className={classes.fromWrapper}>
            <span>{toProperCase(terminus.orig[i18n.language])}</span>
          </div>
        </div>
      </Typography>
    </StyledRouteTerminus>
  );
};

export default RouteTerminus;

const PREFIX = "routeTerminus";

const classes = {
  routeTerminus: `${PREFIX}-routeTerminus`,
  fromToWrapper: `${PREFIX}-fromToWrapper`,
  fromToText: `${PREFIX}-fromToText`,
  fromWrapper: `${PREFIX}-fromWrapper`,
};

const StyledRouteTerminus = styled("div")(({ theme }) => ({
  [`& .${classes.routeTerminus}`]: {
    textAlign: "left",
    fontSize: "1rem",
    width: "75%",
  },
  [`& .${classes.fromToWrapper}`]: {
    display: "flex",
    alignItems: "baseline",
    whiteSpace: "nowrap",
    overflowX: "hidden",
  },
  [`& .${classes.fromToText}`]: {
    fontSize: "0.95rem",
    marginRight: theme.spacing(0.5),
  },
  [`& .${classes.fromWrapper}`]: {
    display: "flex",
    alignItems: "baseline",
    whiteSpace: "nowrap",
    overflowX: "hidden",
    fontSize: "0.75rem",
  },
}));
