import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import RouteTerminus from "./RouteTerminus";
import RouteNoCompany from "./RouteNoCompany";
import { Close as CloseIcon } from "@mui/icons-material";

const RouteRow = ({ route, handleClick, style, onRemove }) => {
  const { i18n } = useTranslation();

  return (
    <Link
      // for SEO, not for click
      to={`/${i18n.language}/route/${route[0].toLowerCase()}`}
      style={style}
    >
      <RowCard variant="outlined" key={route[0]} square>
        <CardActionArea onClick={handleClick}>
          <CardContent className={classes.cardContent}>
            <RouteNoCompany route={route} />
            <RouteTerminus terminus={route[1]} />
          </CardContent>
        </CardActionArea>
        {onRemove !== null && (
          <IconButton onClick={onRemove}>
            <CloseIcon onClick={onRemove} />
          </IconButton>
        )}
      </RowCard>
    </Link>
  );
};

export default RouteRow;

const PREFIX = "routeRow";

const classes = {
  cardContent: `${PREFIX}-cardContent`,
  searchContent: `${PREFIX}-searchContent`,
};

const RowCard = styled(Card)(({ theme }) => ({
  border: "none",
  [`& .${classes.cardContent}`]: {
    display: "grid",
    gridTemplateColumns: "25% 65%",
    padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
    alignItems: "center",
  },
  display: "flex",
  alignItems: "center",
}));
