import { useEffect, useState } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  styled,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const BadWeatherCard = () => {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch(
      "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en"
    )
      .then((r) => r.json())
      .then((d) => setWeather(d));
  }, []);

  const isAdverse = () => {
    if (
      weather &&
      weather.WTCSGNL &&
      adverseWCode.includes(weather.WTCSGNL.code)
    )
      return true;
    if (weather && weather.WRAIN && adverseRCode.includes(weather.WRAIN.code))
      return false;
  };

  if (navigator.userAgent !== "prerendering" && isAdverse()) {
    return (
      <WeatherCard variant="outlined" className={classes.card}>
        <CardActionArea href={t("bad-weather-link")} target="_blank">
          <CardContent>
            <Typography>{t("bad-weather-text")}</Typography>
          </CardContent>
        </CardActionArea>
      </WeatherCard>
    );
  } else {
    return null;
  }
};

export default BadWeatherCard;

const adverseWCode = ["TC8NE", "TC8SE", "TC8NW", "TC8SW", "TC9", "TC10"];
const adverseRCode = ["WARINR", "WRAINB"];

const PREFIX = "route";

const classes = {
  card: `${PREFIX}-card`,
  link: `${PREFIX}-link`,
};

const WeatherCard = styled(Card)(({ theme }) => ({
  [`&.${classes.card}`]: {
    backgroundColor: theme.palette.main,
    borderRadius: theme.shape.borderRadius,
    margin: 0.2,
  },
  [`& .${classes.link}`]: {
    textDecorationLine: "none",
    color: theme.palette.text.primary,
  },
}));
