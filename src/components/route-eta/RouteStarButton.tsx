import { useContext } from "react";
import { IconButton, SxProps, Theme } from "@mui/material";
import {
  Star as StarIcon,
  StarBorderOutlined as StarOutlinedIcon,
} from "@mui/icons-material";
import AppContext from "../../AppContext";

interface RouteStarButtonProps {
  routeId: string;
}

const RouteStarButton = ({ routeId }: RouteStarButtonProps) => {
  const { savedEtas, setCollectionDrawerRoute } = useContext(AppContext);

  return (
    <IconButton
      sx={buttonSx}
      size="small"
      onClick={() => {
        const targetRouteId = `${routeId.toUpperCase()}`;
        setCollectionDrawerRoute(targetRouteId);
      }}
    >
      {savedEtas.includes(routeId) ? <StarIcon /> : <StarOutlinedIcon />}
    </IconButton>
  );
};

export default RouteStarButton;

const buttonSx: SxProps<Theme> = {
  color: (theme) =>
    theme.palette.getContrastText(theme.palette.background.default),
  flexDirection: "column",
  justifyContent: "center",
  "& > .MuiButton-label": {
    flexDirection: "column",
    justifyContent: "center",
  },
  "& > .MuiButton-startIcon": {
    margin: 0,
  },
};
