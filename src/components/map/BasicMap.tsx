import { Button, Grid } from "@mui/material";
import { LatLngExpression } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMapEvent,
} from "react-leaflet";
import { defaultLocation } from "../../utils";

const defaultCenter = [
  defaultLocation.lat,
  defaultLocation.lng,
] as LatLngExpression;

const zoom = 14;

function DisplayPosition({ map, onMove }) {
  const onClick = useCallback(() => {
    map.setView(defaultCenter, zoom);
  }, [map]);

  // const onMove = useCallback(() => {
  //   setPosition(map.getCenter());
  // }, [map]);

  useEffect(() => {
    map.on("move", onMove);
    return () => {
      map.off("move", onMove);
    };
  }, [map, onMove]);

  return (
    <Button style={{ width: "100%" }} variant="outlined" onClick={onClick}>
      當前位置
    </Button>
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
  const animateRef = useRef(true);

  const [map, setMap] = useState(null);

  const handleMove = useCallback(() => {
    setPosition(map.getCenter());
  }, [map, setPosition]);

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
          sx={{ px: 4, py: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Grid item xs={6}>
            <DisplayPosition map={map} onMove={handleMove} />
          </Grid>
          <Grid item xs={6}>
            <label>
              <input
                type="checkbox"
                onChange={() => {
                  animateRef.current = !animateRef.current;
                }}
              />
              減少動態效果
            </label>
          </Grid>
        </Grid>
      ) : null}
      {displayMap}
    </>
  );
};
