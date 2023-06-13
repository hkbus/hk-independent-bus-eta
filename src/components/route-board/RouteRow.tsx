import {
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  SxProps,
  Theme,
} from "@mui/material";
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
      <Card variant="outlined" key={route[0]} square sx={rootSx}>
        <CardActionArea onClick={handleClick}>
          <CardContent sx={cardContentSx}>
            <RouteNoCompany route={route} />
            <RouteTerminus terminus={route[1]} />
          </CardContent>
        </CardActionArea>
        {onRemove !== null && (
          <IconButton onClick={onRemove}>
            <CloseIcon onClick={onRemove} />
          </IconButton>
        )}
      </Card>
    </Link>
  );
};

export default RouteRow;

const rootSx: SxProps<Theme> = {
  border: "none",
  display: "flex",
  alignItems: "center",
};

const cardContentSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "25% 65%",
  py: 0.5,
  px: 2,
  alignItems: "center",
};
