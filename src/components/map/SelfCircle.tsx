import {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AppContext from "../../AppContext";
import { checkPosition } from "../../utils";
import { Circle, Marker } from "react-leaflet";
import L from "leaflet";
import useCompass, { OrientationState } from "react-world-compass";
import "leaflet-rotatedmarker";

interface RotatedMarkerType<T> extends L.Marker<T> {
  setRotationAngle: (angle: number) => void;
  setRotationOrigin: (origin: string) => void;
}

const RotatedMarker = forwardRef<RotatedMarkerType<any>, any>(
  ({ children, ...props }, forwardRef) => {
    const markerRef = useRef<RotatedMarkerType<any>>(null);

    const _compass = useCompass(100);
    const [compass, setCompass] = useState<OrientationState | null>(null);
    useEffect(() => {
      const elf = (nativeEvent: any) => {
        try {
          const data = JSON.parse(nativeEvent.data);
          if (data?.type === "compass") {
            setCompass(data.compass);
          }
        } catch (e) {
          console.log(e);
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

    return (
      <Marker
        ref={(ref) => {
          markerRef.current = ref as RotatedMarkerType<any>;
          if (forwardRef) {
            // @ts-ignore
            forwardRef.current = ref as RotatedMarkerType<any>;
          }
        }}
        {...props}
      >
        {children}
      </Marker>
    );
  }
);

const SelfCircle = () => {
  const { geolocation, geoPermission } = useContext(AppContext);
  const icon = useMemo(() => myIcon(), []);

  if (geoPermission !== "granted") {
    return null;
  }

  return (
    <>
      <Circle center={checkPosition(geolocation)} radius={25} />
      <RotatedMarker
        rotationOrigin="center"
        icon={icon}
        position={checkPosition(geolocation)}
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
