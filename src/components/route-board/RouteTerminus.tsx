import { useTranslation } from "react-i18next";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { toProperCase } from "../../utils";

const RouteTerminus = ({ terminus }) => {
  const { t, i18n } = useTranslation();

  return (
    <Box sx={rootSx}>
      <Box sx={fromToWrapperSx}>
        <span>{`${t("往")} `}</span>
        <Typography component="h3" variant="h6" sx={destinationSx}>
          {toProperCase(terminus.dest[i18n.language])}
        </Typography>
      </Box>
      <Box sx={fromWrapperSx}>
        <Typography variant="body2">
          {toProperCase(terminus.orig[i18n.language])}
        </Typography>
      </Box>
    </Box>
  );
};

export default RouteTerminus;

const rootSx: SxProps<Theme> = {
  textAlign: "left",
  "& > span": {},
};

const fromToWrapperSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  whiteSpace: "nowrap",
  overflowX: "hidden",
  "& > span": {
    fontSize: "0.95rem",
    mr: 0.5,
  },
};

const fromWrapperSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  whiteSpace: "nowrap",
  overflowX: "hidden",
};

const destinationSx: SxProps<Theme> = {
  fontWeight: 700,
};
