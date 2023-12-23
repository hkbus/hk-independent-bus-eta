import { FormControlLabel, Grid, Switch } from "@mui/material";
import type { Location as GeoLocation } from "hk-bus-eta";
import Leaflet, { LatLngExpression } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import debounce from "lodash.debounce";
import isEqual from "lodash.isequal";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMapEvent,
} from "react-leaflet";
import AppContext from "../../AppContext";
import { defaultLocation } from "../../utils";

const defaultCenter = [
  defaultLocation.lat,
  defaultLocation.lng,
] as LatLngExpression;

const zoom = 14;

// the higher the number, the harder to get real and custom location the same
const coordinateDecimal = 3;

function DisplayPosition({
  map,
  geolocation,
  isCurrentGeolocation,
  position,
  setIsCurrentGeolocation,
  onMove,
}) {
  const { t } = useTranslation();

  const [customGeolocation, setCustomGeolocation] = useState(defaultLocation);

  useEffect(() => {
    map.on("move", onMove);
    return () => {
      map.off("move", onMove);
    };
  }, [map, onMove]);

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={!isCurrentGeolocation}
            onChange={(_, checked) => {
              if (checked) {
                map.setView(customGeolocation, zoom);
                setIsCurrentGeolocation(false);
                console.log("on", geolocation, position);
              } else {
                // save custom location when turning off
                setCustomGeolocation(position);
                map.setView(geolocation || defaultCenter, zoom);
                console.log("off", geolocation, position);
              }
            }}
            defaultChecked
          />
        }
        label={!isCurrentGeolocation ? t("自訂位置") : t("現在位置")}
      />
    </>
  );
}

function SetViewOnClick({ map, animateRef }) {
  useMapEvent("click", (e) => {
    map.setView(e.latlng, map.getZoom(), {
      animate: animateRef.current,
    });
  });

  return null;
}

function roundDownLocationCoordinates(
  location: GeoLocation,
  fixed: number
): GeoLocation {
  const getDecimalWithoutRounding = (num, fixed) => {
    const factor = 10 ** fixed;
    return Math.trunc(num * factor) / factor;
  };
  const lat = getDecimalWithoutRounding(location.lat, fixed);
  const lng = getDecimalWithoutRounding(location.lng, fixed);

  return { lat, lng };
}

export const BasicMap = ({ range, position, setPosition }) => {
  const animateRef = useRef(true);

  const { geolocation, colorMode } = useContext(AppContext);

  const [map, setMap] = useState(null);
  const [isCurrentGeolocation, setIsCurrentGeolocation] = useState(
    isEqual(position, geolocation)
  );

  const handleMove = useCallback(() => {
    setPosition(map.getCenter());
  }, [map, setPosition]);

  useEffect(() => {
    setIsCurrentGeolocation(
      isEqual(
        roundDownLocationCoordinates(position, coordinateDecimal),
        roundDownLocationCoordinates(geolocation, coordinateDecimal)
      )
    );
  }, [geolocation, position]);

  const displayMap = useMemo(
    () => (
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
              ? process.env.REACT_APP_OSM_PROVIDER_URL
              : process.env.REACT_APP_OSM_PROVIDER_URL_DARK
          }
        />
        <Marker position={position}></Marker>
        <Circle center={position} radius={range} />
        <SetViewOnClick map={map} animateRef={animateRef} />
      </MapContainer>
    ),
    [colorMode, map, position, range]
  );

  return (
    <>
      {map ? (
        <Grid
          container
          sx={{
            px: { xs: 2, md: 4 },
            py: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Grid item xs={12}>
            <DisplayPosition
              map={map}
              geolocation={geolocation}
              isCurrentGeolocation={isCurrentGeolocation}
              setIsCurrentGeolocation={setIsCurrentGeolocation}
              position={position}
              onMove={debounce(() => {
                handleMove();
              }, 100)}
            />
          </Grid>
        </Grid>
      ) : null}
      {displayMap}
    </>
  );
};
