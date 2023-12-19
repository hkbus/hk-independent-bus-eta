import { LatLngExpression } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const center = [22.3, 114.17] as LatLngExpression;

function MyComponent() {
  const map = useMap();
  console.log("map center:", map.getCenter());
  return null;
}

function MyComponent2() {
  const map = useMapEvents({
    click: () => {
      map.locate();
    },
    locationfound: (location) => {
      console.log("location found:", location);
    },
  });
  return null;
}

export const BasicMap = () => {
  return (
    <MapContainer
      style={{ height: "100%" }}
      center={center}
      zoom={13}
      scrollWheelZoom={false}
    >
      <MyComponent />

      <MyComponent2 />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
      {/* <LayerGroup>
        <Circle center={center} pathOptions={greenOptions} radius={100} />
      </LayerGroup> */}
    </MapContainer>
  );
};
