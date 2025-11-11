import Leaflet from "leaflet";
import { useContext } from "react";
import { TileLayer } from "react-leaflet";
import AppContext from "../../context/AppContext";
import useLanguage from "../../hooks/useTranslation";
import { Box, SxProps, Theme } from "@mui/material";

const BaseTile = () => {
  const { colorMode } = useContext(AppContext);
  const language = useLanguage();
  return (
    <>
      <TileLayer
        crossOrigin="anonymous"
        maxZoom={Leaflet.Browser.retina ? 20 : 19}
        maxNativeZoom={18}
        keepBuffer={10}
        updateWhenIdle={false}
        url={
          colorMode === "light"
            ? import.meta.env.VITE_BASE_MAP_URL
            : import.meta.env.VITE_BASE_MAP_URL_DARK
        }
      />
      <TileLayer
        crossOrigin="anonymous"
        maxZoom={Leaflet.Browser.retina ? 20 : 19}
        maxNativeZoom={20}
        keepBuffer={10}
        updateWhenIdle={false}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a> &copy; <a href="https://api.portal.hkmapservice.gov.hk/disclaimer" target="_blank">Lands Department</a>'
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
