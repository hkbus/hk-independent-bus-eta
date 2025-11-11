import React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

interface CenterControlProps {
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

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
  bottom: 20,
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
  "& .map-centralControl": {
    padding: "2px",
    color: "black !important",
  },
};
