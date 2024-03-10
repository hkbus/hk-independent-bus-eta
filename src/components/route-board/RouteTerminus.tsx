import { useTranslation } from "react-i18next";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { toProperCase } from "../../utils";
import { RouteListEntry } from "hk-bus-eta";
import useLanguage from "../../hooks/useTranslation";

interface RouteTerminus {
  terminus: RouteListEntry;
}

const RouteTerminus = ({ terminus }: RouteTerminus) => {
  const { t } = useTranslation();
  const language = useLanguage()

  return (
    <Box sx={rootSx}>
      <Box sx={fromToWrapperSx}>
        <span>{`${t("往")} `}</span>
        <Typography component="h3" variant="h6" sx={destinationSx}>
          {toProperCase(terminus.dest[language])}
        </Typography>
      </Box>
      <Box sx={fromWrapperSx}>
        <Typography variant="body2">
          {toProperCase(terminus.orig[language])}
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
    fontSize: "0.95em",
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
