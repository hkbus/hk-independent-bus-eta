import { useContext, useEffect } from "react";
import AppContext from "../../context/AppContext";
import { Box, SxProps, Theme } from "@mui/material";
import { Map } from "maplibre-gl";

interface BaseTileProps {
  map: Map | null;
}

const BaseTile = ({ map }: BaseTileProps) => {
  const { colorMode } = useContext(AppContext);

  useEffect(() => {
    if (!map) return;
  }, [map, colorMode]);

  return (
    <Box sx={attrSx}>
      <img src="/img/Lands_Department.svg" alt="Lands Department" />
    </Box>
  );
};

export default BaseTile;

const attrSx: SxProps<Theme> = {
  position: "absolute",
  bottom: 20,
  right: 40,
  width: 32,
  height: 32,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  pointerEvents: "none",
  zIndex: 1,
  "& img": {
    width: 20,
    height: 20,
    opacity: 0.8,
  },
};
