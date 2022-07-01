import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import RouteNo from "./RouteNo";

const RouteNoCompany = ({ route }) => {
  const { t } = useTranslation();
  const [routeNo, serviceType] = route[0].split("-").slice(0, 2);

  return (
    <StyledRouteNoCompany>
      <div>
        <RouteNo routeNo={routeNo} />
        {parseInt(serviceType, 10) >= 2 && (
          <Typography variant="caption" className={classes.specialTrip}>
            {t("特別班")}
          </Typography>
        )}
      </div>
      <Typography component="h4" variant="caption" className={classes.company}>
        {route[1].co.map((co) => t(co)).join("+")}
      </Typography>
    </StyledRouteNoCompany>
  );
};

export default RouteNoCompany;

const PREFIX = "routeNoCompany";

const classes = {
  company: `${PREFIX}-company`,
  specialTrip: `${PREFIX}-specialTrip`,
};

const StyledRouteNoCompany = styled("div")(({ theme }) => ({
  [`& .${classes.company}`]: {
    color: theme.palette.text.secondary,
  },
  [`& .${classes.specialTrip}`]: {
    fontSize: "0.6rem",
    marginLeft: "8px",
  },
}));
