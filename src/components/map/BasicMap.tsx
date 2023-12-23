import { Grid, Switch } from "@mui/material";
import { LatLngExpression } from "leaflet";
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

function DisplayPosition({ map, geolocation, isCurrentGeolocation, onMove }) {
  const { t } = useTranslation();

  const onClick = useCallback(() => {
    map.setView(geolocation || defaultCenter, zoom);
  }, [geolocation, map]);

  useEffect(() => {
    map.on("move", onMove);
    return () => {
      map.off("move", onMove);
    };
  }, [map, onMove]);

  return (
    <>
      <Switch
        checked={isCurrentGeolocation}
        onChange={(_, checked) => {
          console.log(checked);
          if (checked) onClick();
        }}
        defaultChecked
      />
      {isCurrentGeolocation ? t("當前位置") : t("自訂位置")}
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

export const BasicMap = ({ range, position, setPosition }) => {
  const { t } = useTranslation();

  const animateRef = useRef(true);

  const { geolocation } = useContext(AppContext);

  const [map, setMap] = useState(null);
  const [isCurrentGeolocation, setIsCurrentGeolocation] = useState(
    position === geolocation
  );

  const handleMove = useCallback(() => {
    setPosition(map.getCenter());
  }, [map, setPosition]);

  useEffect(() => {
    setIsCurrentGeolocation(isEqual(position, geolocation));
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
