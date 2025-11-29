import Leaflet from "leaflet";
import { useContext, useEffect } from "react";
import { TileLayer, useMap } from "react-leaflet";
import AppContext from "../../context/AppContext";
import useLanguage from "../../hooks/useTranslation";
import { Box, SxProps, Theme } from "@mui/material";
import { PMTiles, leafletRasterLayer } from "pmtiles";

const BaseTile = () => {
  const { colorMode } = useContext(AppContext);
  const language = useLanguage();
  const map = useMap();

  useEffect(() => {
    const p = new PMTiles(
      colorMode === "dark"
        ? "https://pmtiles.hkbus.app/hong-kong-raster-dark.pmtiles"
        : "https://pmtiles.hkbus.app/hong-kong-raster.pmtiles"
    );
    const layer = leafletRasterLayer(p, {
      // Source provides map tiles up to zoom level 17
      // See https://github.com/hkbus/hk-pmtiles-generation/blob/main/.github/workflows/generate-maptiles.yml
      maxNativeZoom: 17,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    } as Leaflet.TileLayerOptions).addTo(map);
    layer.bringToBack();
    return () => {
      map.removeLayer(layer);
    };
  }, [map, colorMode]);

  return (
    <>
      <TileLayer
        crossOrigin="anonymous"
        maxZoom={Leaflet.Browser.retina ? 20 : 19}
        maxNativeZoom={20}
        keepBuffer={10}
        updateWhenIdle={false}
        attribution='&copy; <a href="https://api.portal.hkmapservice.gov.hk/disclaimer" target="_blank">Lands Department</a>'
        url={import.meta.env.VITE_MAP_LABEL_URL.replace(
          "{lang}",
          language === "zh" ? "tc" : "en"
        )}
      />
      <div className="leaflet-bottom leaflet-right">
        <Box sx={attrSx}>
          <img src="/img/Lands_Department.svg" alt="Lands Department" />
        </Box>
      </div>
    </>
  );
};

export default BaseTile;

const attrSx: SxProps<Theme> = {
  width: 32,
  height: 32,
  marginBottom: "20px !important",
  marginRight: "40px !important",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  pointerEvents: "none",
  "& img": {
    width: 20,
    height: 20,
    opacity: 0.8,
  },
};
