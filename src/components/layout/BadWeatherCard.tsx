import { Card, CardContent, Typography } from "@mui/material";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import "./BadWeatherCard.css";

const inBadWeather = () => {
  fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en').then(response => {
    if (response.ok) {
      let blob = response.text();
      blob.then(data => {
        console.log("checking weather");
        const text = JSON.stringify(data);
        const adverseCode = /((\\"code\\":\\")+(TC8\w+|TC9|TC10|WRAINR|WRAINB))/gi;
        const match = text.match(adverseCode);
        if (match) {
        }
      })
    }
  })
}

const BasicCard = () => {
  const { t } = useTranslation();
  const {colorMode} = useContext(AppContext);
  let cardClass = 'card';
  if (colorMode === "dark"){
    cardClass += ' card-dark';
  }
  return (
    <Card variant="outlined" sx={{ m: 0.2, display: inBadWeather ? "" : "none" }}>
      <a href={t("bad-weather-link")}>
        <CardContent>
          <Typography className={cardClass}>
            {t("bad-weather-text")}
          </Typography>
        </CardContent>
      </a>
    </Card>
  );
}

export default BasicCard;