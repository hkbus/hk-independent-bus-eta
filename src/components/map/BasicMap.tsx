import { FormControlLabel, Grid, Switch } from "@mui/material";
import { LatLngExpression } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import debounce from "lodash.debounce";
import isEqual from "lodash.isequal";
import type { Location as GeoLocation } from "hk-bus-eta";
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
  const { t } = useTranslation();

  const animateRef = useRef(true);

  const { geolocation } = useContext(AppContext);

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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}></Marker>
        <Circle center={position} radius={range} />
        <SetViewOnClick map={map} animateRef={animateRef} />
      </MapContainer>
    ),
    [map, position, range]
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
          <Grid item xs={6}>
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
          <Grid
            item
            xs={6}
            sx={{
              textAlign: "center",
            }}
          >
            <label style={{ display: "block" }}>
              <input
                type="checkbox"
                onChange={() => {
                  animateRef.current = !animateRef.current;
                }}
              />
              {t("減少動態效果")}
            </label>
          </Grid>
        </Grid>
      ) : null}
      {displayMap}
    </>
  );
};
