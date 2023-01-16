import { Card, CardActionArea, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import RouteTerminus from "./RouteTerminus";
import RouteNoCompany from "./RouteNoCompany";

const RouteRow = ({ route, handleClick, style }) => {
  const { i18n } = useTranslation();

  return (
    <Link
      onClick={handleClick}
      to={`/${i18n.language}/route/${route[0].toLowerCase()}`}
      style={style}
    >
      <RowCard variant="outlined" key={route[0]} square>
        <CardActionArea>
          <CardContent className={classes.cardContent}>
            <RouteNoCompany route={route} />
            <RouteTerminus terminus={route[1]} />
          </CardContent>
        </CardActionArea>
      </RowCard>
    </Link>
  );
};

export default RouteRow;

const PREFIX = "routeRow";

const classes = {
  cardContent: `${PREFIX}-cardContent`,
};

const RowCard = styled(Card)(({ theme }) => ({
  border: "none",
  [`& .${classes.cardContent}`]: {
    display: "grid",
    gridTemplateColumns: "25% 75%",
    padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
    alignItems: "center",
  },
}));
