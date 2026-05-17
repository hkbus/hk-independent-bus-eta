import { useCallback, useContext } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { Explore as ExploreIcon } from "@mui/icons-material";
import { isSafari, requestPermission } from "react-world-compass";
import AppContext from "../../../context/AppContext";

/**
 * Compass-permission prompt. Rendered as an absolutely-positioned
 * overlay inside `<BaseMap>`. Only visible on Safari while compass
 * permission has not been granted; clicking requests permission via
 * `react-world-compass`.
 */
const CompassControl = () => {
  const { compassPermission, setCompassPermission } = useContext(AppContext);
  const handleClick = useCallback(() => {
    requestPermission().then((r) => {
      setCompassPermission(r);
    });
  }, [setCompassPermission]);

  if (!isSafari || compassPermission === "granted") return null;

  return (
    <Box sx={compassControlSx} onClick={handleClick}>
      <ExploreIcon sx={{ p: "3px", color: "black" }} />
    </Box>
  );
};

export default CompassControl;

const compassControlSx: SxProps<Theme> = {
  position: "absolute",
  // Stacks above CenterControl.
  bottom: 57,
  right: 5,
  width: 32,
  height: 32,
  background: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  borderRadius: "2px",
  boxShadow: "0 1px 5px rgba(0,0,0,0.4)",
  zIndex: 2,
};
