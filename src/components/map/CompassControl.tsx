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
    <Box sx={compassControlSx} onClick={handleClick}>
      <ExploreIcon sx={{ p: "3px", color: "black" }} />
    </Box>
  );
};

export default CompassControl;

const compassControlSx: SxProps<Theme> = {
  position: "absolute",
  bottom: 57,
  right: 5,
  background: "white",
  width: 32,
  height: 32,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "4px",
  boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
  cursor: "pointer",
  zIndex: 1,
};
