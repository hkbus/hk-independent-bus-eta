import type { MouseEventHandler } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

interface CenterControlProps {
  onClick: MouseEventHandler<HTMLDivElement>;
}

/**
 * "Recentre on my location" button. Rendered as an absolutely-
 * positioned overlay inside `<BaseMap>`.
 */
const CenterControl = ({ onClick }: CenterControlProps) => {
  return (
    <Box sx={centerControlSx} onClick={onClick}>
      <MyLocationIcon className="map-centralControl" />
    </Box>
  );
};

export default CenterControl;

const centerControlSx: SxProps<Theme> = {
  position: "absolute",
  bottom: 40,
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
  "& .map-centralControl": {
    padding: "2px",
    color: "black !important",
  },
};
