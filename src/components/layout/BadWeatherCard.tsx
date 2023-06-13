import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useWeather } from "../Weather";

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
      <Card variant="outlined" sx={rootSx}>
        <CardActionArea href={t("bad-weather-link")} target="_blank">
          <CardContent>
            <Typography>{t("bad-weather-text")}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
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
  margin: 0.2,
  height: "100%",
  [`> a`]: {
    height: "100%",
  },
};
