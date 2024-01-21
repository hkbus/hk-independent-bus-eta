import React, { useContext } from "react";
import { IconButton, SxProps, Theme } from "@mui/material";
import WatchIcon from "@mui/icons-material/Watch";
import ReactNativeContext from "../../ReactNativeContext";

const RouteWatchButton = ({ routeId }) => {
  const { os } = useContext(ReactNativeContext);

  return (
    <IconButton
      sx={buttonSx}
      size="small"
      onClick={() => {
        const isApple =
        os === "ios" || /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
        const subdomain = isApple ? "watch" : "wear";
        const url = `https://${subdomain}.hkbus.app/route/${routeId.toLowerCase()}`;
        window.open(url, "_blank");
      }}
    >
      <WatchIcon />
    </IconButton>
  );
};

export default RouteWatchButton;

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
