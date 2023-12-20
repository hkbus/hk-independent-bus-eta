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

const defaultCenter = [
  defaultLocation.lat,
  defaultLocation.lng,
] as LatLngExpression;

const zoom = 13;

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
    <p>
      {/* latitude: {position.lat.toFixed(4)}, longitude: {position.lng.toFixed(4)}{" "} */}
      <button onClick={onClick}>reset</button>
    </p>
  );
}

function SetViewOnClick({ animateRef }) {
  const map = useMapEvent("click", (e) => {
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
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        <Circle center={position} radius={range} />
        <SetViewOnClick animateRef={animateRef} />
      </MapContainer>
    ),
    [position, range]
  );

  return (
    <>
      <p>
        <label>
          <input
            type="checkbox"
            onChange={() => {
              animateRef.current = !animateRef.current;
            }}
          />
          減少動態效果
        </label>
      </p>
      {map ? <DisplayPosition map={map} onMove={handleMove} /> : null}
      {displayMap}
    </>
  );
};
