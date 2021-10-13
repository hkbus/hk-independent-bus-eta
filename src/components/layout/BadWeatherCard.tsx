import { Card, CardContent, styled, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const inBadWeather = () => {
  fetch(
    "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en"
  ).then((response) => {
    if (response.ok) {
      let blob = response.text();
      blob.then((data) => {
        console.log("checking weather");
        const text = JSON.stringify(data);
        const adverseCode =
          /((\\"code\\":\\")+(TC8\w+|TC9|TC10|WRAINR|WRAINB))/gi;
        const match = text.match(adverseCode);
        if (match) {
        }
      });
    }
  });
};
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.main,
  borderRadius: theme.shape.borderRadius,
}));

const StyledLink = styled('a')(({ theme }) => ({
  textDecorationLine: 'none',
  color: theme.palette.text.primary,
}))

const BadWeatherCard = () => {
  const { t } = useTranslation();
  return (
    <StyledCard
      variant="outlined"
      sx={{ m: 0.2, display: inBadWeather ? "" : "none" }}
    >
      <StyledLink href={t("bad-weather-link")}>
        <CardContent>
          <Typography>{t("bad-weather-text")}</Typography>
        </CardContent>
      </StyledLink>
    </StyledCard>
  );
};

export default BadWeatherCard;
