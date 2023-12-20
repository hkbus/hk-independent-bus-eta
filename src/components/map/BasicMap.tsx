import { LatLngExpression } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvent,
} from "react-leaflet";
import { defaultLocation } from "../../utils";
import { Box, Button } from "@mui/material";

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
    <Button style={{ flex: 1 }} variant="outlined" onClick={onClick}>
      返回原有位置
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

export const BasicMap = ({ range }) => {
  const animateRef = useRef(true);

  const [map, setMap] = useState(null);
  const [position, setPosition] = useState<LatLngExpression>({
    lat: defaultLocation.lat,
    lng: defaultLocation.lng,
  });

  const handleMove = useCallback(() => {
    setPosition(map.getCenter());
  }, [map]);

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
      {displayMap}
      {map ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            padding: 2,
          }}
        >
          <label style={{ flex: 1 }}>
            <input
              type="checkbox"
              onChange={() => {
                animateRef.current = !animateRef.current;
              }}
            />
            減少動態效果
          </label>
          <DisplayPosition map={map} onMove={handleMove} />
        </Box>
      ) : null}
    </>
  );
};
