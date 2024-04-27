import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Box, SxProps, Theme } from "@mui/material";
import Leaflet from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMapEvent,
} from "react-leaflet";
import AppContext from "../../context/AppContext";
import { Location } from "hk-bus-eta";

interface RangeMapProps {
  range: number;
  value: Location;
  onChange: (location: Location) => void;
}

const RangeMap = React.forwardRef<Leaflet.Map, RangeMapProps>(
  ({ range, value, onChange }, ref) => {
    const markerRef = useRef<Leaflet.Marker>(null);
    const circleRef = useRef<Leaflet.Circle>(null);
    const position = useRef<Location>(value).current;
    const { geolocation, colorMode } = useContext(AppContext);
    const [map, setMap] = useState<Leaflet.Map | null>(null);

    useImperativeHandle(ref, () => map as Leaflet.Map, [map]);

    const handleMove = useCallback(() => {
      if (map === null) return;
      markerRef.current?.setLatLng(map.getCenter());
      circleRef.current?.setLatLng(map.getCenter());
      onChange(map.getCenter());
    }, [onChange, map]);

    useEffect(() => {
      map?.on("move", handleMove);
      return () => {
        map?.off("move", handleMove);
      };
    }, [handleMove, map]);

    return (
      <MapContainer
        style={{ height: "100%", position: "relative" }}
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        ref={setMap}
      >
        <TileLayer
          crossOrigin="anonymous"
          maxZoom={Leaflet.Browser.retina ? 20 : 19}
          maxNativeZoom={18}
          keepBuffer={10}
          updateWhenIdle={false}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            colorMode === "light"
              ? import.meta.env.VITE_OSM_PROVIDER_URL
              : import.meta.env.VITE_OSM_PROVIDER_URL_DARK
          }
        />
        <Marker position={position} ref={markerRef} />
        <Circle center={position} radius={range} ref={circleRef} />
        <SetViewOnClick map={map as Leaflet.Map} onChange={onChange} />
        <CenterControl
          onClick={() => {
            map?.setView(geolocation.current, map?.getZoom(), {
              animate: true,
            });
          }}
        />
      </MapContainer>
    );
  }
);

export default RangeMap;

const zoom = 14;

interface SetViewOnClickProps {
  map: Leaflet.Map;
  onChange: (v: Location) => void;
}

const SetViewOnClick = ({ map, onChange }: SetViewOnClickProps) => {
  useMapEvent("click", (e) => {
    map.setView(e.latlng, map.getZoom(), {
      animate: true,
    });
    onChange(e.latlng);
  });

  return null;
};

const CenterControl = ({
  onClick,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <div className="leaflet-bottom leaflet-right">
      <Box
        sx={centerControlSx}
        className="leaflet-control leaflet-bar"
        onClick={onClick}
      >
        <MyLocationIcon className={classes.centerControl} />
      </Box>
    </div>
  );
};

const PREFIX = "range-map";

const classes = {
  mapContainerBox: `${PREFIX}-mapContainerBox`,
  mapContainer: `${PREFIX}-mapContainer`,
  centerControl: `${PREFIX}-centerControl`,
  marker: `${PREFIX}-marker`,
  active: `${PREFIX}-active`,
  passed: `${PREFIX}-passed`,
};

const centerControlSx: SxProps<Theme> = {
  background: "white",
  width: 32,
  height: 32,
  marginBottom: "20px !important",
  marginRight: "5px !important",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  [`& .${classes.centerControl}`]: {
    padding: "3px",
    color: "black",
  },
};
