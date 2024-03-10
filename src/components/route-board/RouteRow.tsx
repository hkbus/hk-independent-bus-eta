import React, { MouseEventHandler } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  SxProps,
  Theme,
} from "@mui/material";
import { Link } from "react-router-dom";
import RouteTerminus from "./RouteTerminus";
import RouteNoCompany from "./RouteNoCompany";
import { Close as CloseIcon } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import { RouteListEntry } from "hk-bus-eta";
import useLanguage from "../../hooks/useTranslation";

interface RouteRowProps {
  route: [string, RouteListEntry];
  style: React.CSSProperties;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onRemove?: MouseEventHandler<HTMLButtonElement>;
}

const RouteRow = ({ route, onClick, style, onRemove }: RouteRowProps) => {
  const language = useLanguage()

  return (
    <Link
      // for SEO, not for click
      to={`/${language}/route/${route[0].toLowerCase()}`}
      style={style}
    >
      <Card variant="outlined" key={route[0]} square sx={rootSx}>
        <CardActionArea onClick={onClick}>
          <CardContent sx={cardContentSx}>
            <RouteNoCompany route={route} />
            <RouteTerminus terminus={route[1]} />
          </CardContent>
        </CardActionArea>
        {onRemove && (
          <IconButton onClick={onRemove}>
            <CloseIcon />
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
  height: "100%",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBlockColor: (t) => (t.palette.mode === "dark" ? grey[900] : grey[200]),
};

const cardContentSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "25% 65%",
  py: 0.5,
  px: 2,
  alignItems: "center",
};
