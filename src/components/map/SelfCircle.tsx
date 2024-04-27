import { useContext, useEffect, useMemo, useRef, useState } from "react";
import AppContext from "../../AppContext";
import { checkPosition } from "../../utils";
import { Circle, Marker, MarkerProps } from "react-leaflet";
import L from "leaflet";
import useCompass, { OrientationState } from "react-world-compass";
import "leaflet-rotatedmarker";
import { Location } from "hk-bus-eta";

interface RotatedMarkerProps extends MarkerProps {
  rotationOrigin: string;
  // setRotationAngle: (angle: number) => void;
  // setRotationOrigin: (origin: string) => void;
}

interface RotatedMarkerRef extends L.Marker {
  setRotationAngle: (angle: number) => void;
  setRotationOrigin: (origin: string) => void;
}

const RotatedMarker = (props: RotatedMarkerProps) => {
  const markerRef = useRef<RotatedMarkerRef | null>(null);

  const _compass = useCompass(100);
  const [compass, setCompass] = useState<OrientationState | null>(null);
  useEffect(() => {
    const elf = (nativeEvent: any) => {
      try {
        const data = JSON.parse(nativeEvent.data);
        if (data?.type === "compass") {
          setCompass({
            degree: data.degree,
            accuracy: data.accuracy,
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("message", elf);
    return () => {
      window.removeEventListener("message", elf);
    };
  }, []);

  useEffect(() => {
    setCompass(_compass);
  }, [_compass]);

  useEffect(() => {
    const marker = markerRef.current;
    if (marker && compass) {
      marker.setRotationAngle(360 - compass.degree);
      marker.setRotationOrigin("center");
    }
  }, [compass]);

  if (compass === null) {
    return <></>;
  }

  return <Marker ref={markerRef} {...props} />;
};

const SelfCircle = () => {
  const { geolocation, geoPermission } = useContext(AppContext);
  const icon = useMemo(() => myIcon(), []);
  const [state, setState] = useState<Location>(
    checkPosition(geolocation.current)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setState(checkPosition(geolocation.current));
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [geolocation]);

  if (geoPermission !== "granted") {
    return null;
  }

  return (
    <>
      <Circle center={state} radius={25} />
      <RotatedMarker
        key="rotated-marker"
        rotationOrigin="center"
        icon={icon}
        position={state}
      />
    </>
  );
};

export default SelfCircle;

const myIcon = () => {
  return L.divIcon({
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: "self-center",
  });
};
