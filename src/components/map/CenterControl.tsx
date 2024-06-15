import React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

interface CenterControlProps {
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

const CenterControl = ({ onClick }: CenterControlProps) => {
  return (
    <div className="leaflet-bottom leaflet-right">
      <Box
        sx={centerControlSx}
        className="leaflet-control leaflet-bar"
        onClick={onClick}
      >
        <MyLocationIcon className="map-centralControl" />
      </Box>
    </div>
  );
};

export default CenterControl;

const centerControlSx: SxProps<Theme> = {
  background: "white",
  width: 32,
  height: 32,
  marginBottom: "20px !important",
  marginRight: "5px !important",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  "& .map-centralControl": {
    padding: "2px",
    color: "black !important",
  },
};
