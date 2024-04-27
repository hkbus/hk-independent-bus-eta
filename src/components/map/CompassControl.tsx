import { Box, SxProps, Theme } from "@mui/material";
import { Explore as ExploreIcon } from "@mui/icons-material";
import { isSafari, requestPermission } from "react-world-compass";
import { useCallback, useContext } from "react";
import AppContext from "../../context/AppContext";

const CompassControl = () => {
  const { compassPermission, setCompassPermission } = useContext(AppContext);
  const handleClick = useCallback(() => {
    requestPermission().then((r) => {
      setCompassPermission(r);
    });
  }, [setCompassPermission]);

  if (!isSafari || compassPermission === "granted") {
    return <></>;
  }

  return (
    <div className="leaflet-bottom leaflet-right">
      <Box
        sx={compassControlSx}
        className="leaflet-control leaflet-bar"
        onClick={handleClick}
      >
        <ExploreIcon sx={{ p: "3px", color: "black" }} />
      </Box>
    </div>
  );
};

export default CompassControl;

const compassControlSx: SxProps<Theme> = {
  background: "white",
  width: 32,
  height: 32,
  marginBottom: "57px !important",
  marginRight: "5px !important",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
