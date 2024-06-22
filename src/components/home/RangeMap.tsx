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
import { Circle, MapContainer, Marker, useMapEvent } from "react-leaflet";
import AppContext from "../../context/AppContext";
import { Location } from "hk-bus-eta";
import CenterControl from "../map/CenterControl";
import BaseTile from "../map/BaseTile";

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
    const { geolocation } = useContext(AppContext);
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

    useEffect(() => {
      const bounds = circleRef.current?.getBounds();
      bounds && map?.fitBounds(bounds);
    }, [map, range]);

    return (
      <MapContainer
        style={{ height: "100%", position: "relative" }}
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        ref={setMap}
      >
        <BaseTile />
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
