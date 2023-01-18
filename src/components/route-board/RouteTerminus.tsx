import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { toProperCase } from "../../utils";

const RouteTerminus = ({ terminus }) => {
  const { t, i18n } = useTranslation();

  return (
    <StyledRouteTerminus>
      <div className={classes.fromToWrapper}>
        <span className={classes.fromToText}>{`${t("往")} `}</span>
        <Typography component="h3" variant="h6" className={classes.destination}>
          {toProperCase(terminus.dest[i18n.language])}
        </Typography>
      </div>
      <div className={classes.fromWrapper}>
        <Typography variant="body2">
          {toProperCase(terminus.orig[i18n.language])}
        </Typography>
      </div>
    </StyledRouteTerminus>
  );
};

export default RouteTerminus;

const PREFIX = "routeTerminus";

const classes = {
  fromToWrapper: `${PREFIX}-fromToWrapper`,
  fromToText: `${PREFIX}-fromToText`,
  fromWrapper: `${PREFIX}-fromWrapper`,
  destination: `${PREFIX}-destination`,
};

const StyledRouteTerminus = styled("div")(({ theme }) => ({
  textAlign: "left",
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
  },
  [`& .${classes.destination}`]: {
    fontWeight: 700,
  },
}));
