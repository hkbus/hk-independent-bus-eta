import { useTranslation } from "react-i18next";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import RouteNo from "./RouteNo";
import useLanguage from "../../hooks/useTranslation";
import { RouteListEntry } from "hk-bus-eta";

interface RouteNoCompanyProps {
  route: [string, RouteListEntry];
}

const RouteNoCompany = ({ route }: RouteNoCompanyProps) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const [routeNo, serviceType] = route[0].split("-").slice(0, 2);

  return (
    <Box overflow="hidden">
      <RouteNo
        routeNo={language === "zh" ? t(routeNo) : routeNo}
        fontSize={route[1].co[0] === "mtr" ? "1.2rem" : undefined}
      />
      {parseInt(serviceType, 10) >= 2 && (
        <Typography variant="caption" sx={specialTripSx}>
          {t("特別班")}
        </Typography>
      )}
      <Typography component="h4" variant="caption" sx={companySx}>
        {Object.keys(route[1].stops)
          .map((co) => t(co))
          .join("+")}
      </Typography>
    </Box>
  );
};

export default RouteNoCompany;

const companySx: SxProps<Theme> = {
  color: (theme) => theme.palette.text.secondary,
};

const specialTripSx: SxProps<Theme> = {
  fontSize: "0.6rem",
  marginLeft: "8px",
};
