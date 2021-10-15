import { useEffect, useState } from "react";
import { Card, CardContent, styled, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line
const adverseCode = new RegExp('(("code":")+(TC8+|TC9|TC10|WRAINR|WRAINB))');

const useFetch = (url) => {
  const [data, setData] = useState(null);
  async function fetchData() {
    const response = await fetch(url);
    const json = await response.json();
    setData(json);
    //Test string, comment in production
    // setData({ "WTCSGNL": { "name": "Tropical Cyclone Warning Signal", "code": "TC8NE", "actionCode": "ISSUE", "type": "No. 8 Northeast Gale or Storm Signal", "issueTime": "2021-10-12T17:20:00+08:00", "updateTime": "2021-10-12T17:20:00+08:00" } });
  }
  useEffect(() => {
    fetchData();
  }, []);
  return data;
};

function BadWeatherCard() {
  let match = false;
  let string = "";
  //Hook cannot go under if()
  const { t } = useTranslation();
  let bwLink = t("bad-weather-link");
  let bwText = t("bad-weather-text");
  const data = useFetch(
    "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en"
  );

  string = JSON.stringify(data);
  match = adverseCode.test(string);
  if (match) {
    return clickCard(bwText, bwLink);
  } else {
    return null;
  }
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.main,
  borderRadius: theme.shape.borderRadius,
  margin: 0.2,
}));

const StyledLink = styled("a")(({ theme }) => ({
  textDecorationLine: "none",
  color: theme.palette.text.primary,
}));

const clickCard = (content, link) => {
  return (
    <StyledCard variant="outlined">
      <StyledLink href={link}>
        <CardContent>
          <Typography>{content}</Typography>
        </CardContent>
      </StyledLink>
    </StyledCard>
  );
};

export default BadWeatherCard;
