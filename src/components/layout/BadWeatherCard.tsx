import React from "react";
import {
  Paper,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useWeather } from "../Weather";
import ErrorIcon from '@mui/icons-material/Error';

const BadWeatherCard = () => {
  const { t } = useTranslation();
  const weather = useWeather();

  const isAdverse = () => {
    if (!weather) {
      return false;
    } else if (weather.WTCSGNL && adverseWCode.includes(weather.WTCSGNL.code)) {
      return true;
    } else if (weather.WRAIN && adverseRCode.includes(weather.WRAIN.code)) {
      return true;
    } else {
      return false;
    }
  };

  if (navigator.userAgent !== "prerendering" && isAdverse()) {
    return (
      <Paper 
        variant="outlined" 
        sx={rootSx} 
        onClick={() => window.open(t("bad-weather-link"), "_target")}
      >
        <ErrorIcon color="error" />
        <Typography>
          {t("bad-weather-text")}
        </Typography>
      </Paper>
    );
  } else {
    return null;
  }
};

export default BadWeatherCard;

const adverseWCode = ["TC8NE", "TC8SE", "TC8NW", "TC8SW", "TC9", "TC10"];
const adverseRCode = ["WARINR", "WRAINB"];

const rootSx: SxProps<Theme> = {
  borderRadius: (theme) => theme.shape.borderRadius,
  cursor: "pointer",
  px: 2,
  py: 1,
  display: 'flex',
  alignItems: 'center',
  textAlign: 'left',
  gap: 1
};
