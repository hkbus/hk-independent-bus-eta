import {
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Polyline,
  Circle,
} from "react-leaflet";
import Leaflet from "leaflet";
import markerIcon2X from "leaflet/dist/images/marker-icon-2x.png";
import { Box, SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import type { StopListEntry } from "hk-bus-eta";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { checkPosition, locationEqual } from "../../utils";
import type { Map as LeafletMap } from "leaflet";
import type { Location as GeoLocation } from "hk-bus-eta";

const SelfCircle = () => {
  const { geolocation, geoPermission } = useContext(AppContext);
  if (geoPermission !== "granted") {
    return null;
  }
  return <Circle center={checkPosition(geolocation)} radius={25} />;
};

const CenterControl = ({ onClick }) => {
  return (
    <div className="leaflet-bottom leaflet-right">
      <Box
        sx={centerControlSx}
        className="leaflet-control leaflet-bar"
        onClick={onClick}
      >
        <MyLocationIcon className={classes.centerControl} />
      </Box>
    </div>
  );
};

interface RouteMapProps {
  stops: Array<StopListEntry>;
  stopIdx: number;
  onMarkerClick: (idx: number, event: unknown) => void;
}

interface RouteMapRef {
  initialCenter: GeoLocation;
  map?: LeafletMap;
  currentStopCenter: GeoLocation;
  /**
   * last center that requested by map.flyTo() / map.setView()
   */
  center: GeoLocation;
  isFollow: boolean;
  stops: Array<StopListEntry>;
  stopIdx: number;
}

const RouteMap = ({ stops, stopIdx, onMarkerClick }: RouteMapProps) => {
  const { geolocation, geoPermission, updateGeoPermission, colorMode } =
    useContext(AppContext);
  const { i18n } = useTranslation();
  const [map, setMap] = useState<Leaflet.Map>(null);
  const mapRef = useRef<RouteMapRef>({
    initialCenter: stops[stopIdx] ? stops[stopIdx].location : checkPosition(),
    currentStopCenter: stops[stopIdx]
      ? stops[stopIdx].location
      : checkPosition(),
    center: stops[stopIdx] ? stops[stopIdx].location : checkPosition(),
    isFollow: false,
    stops: stops,
    stopIdx: stopIdx,
  });

  useEffect(() => {
    let isFollow: boolean, _center: GeoLocation;
    if (mapRef.current.stops !== stops || mapRef.current.stopIdx !== stopIdx) {
      isFollow = false;
    } else {
      isFollow = mapRef.current.isFollow;
    }
    if (
      mapRef.current.stops === stops &&
      mapRef.current.stopIdx === stopIdx &&
      isFollow
    ) {
      _center = geolocation;
    } else {
      _center = stops[stopIdx] ? stops[stopIdx].location : checkPosition();
    }
    const center = mapRef.current.center;
    if (center !== _center && !locationEqual(_center, center)) {
      if (mapRef.current.stops !== stops) {
        mapRef.current.map?.setView(_center);
      } else {
        mapRef.current.map?.flyTo(_center);
      }
    }
    mapRef.current = {
      ...mapRef.current,
      center: _center,
      currentStopCenter: stops[stopIdx]
        ? stops[stopIdx].location
        : checkPosition(),
      stops: stops,
      stopIdx: stopIdx,
      isFollow: isFollow,
    };
  }, [stops, stopIdx, geolocation]);

  useEffect(() => {
    if (map) {
      mapRef.current = {
        ...mapRef.current,
        map: map,
      };
      const stopFollowingDeviceGeoLocation = () => {
        mapRef.current = {
          ...mapRef.current,
          center: mapRef.current.currentStopCenter,
          isFollow: false,
        };
      };
      map?.on({
        dragend: stopFollowingDeviceGeoLocation,
        dragstart: stopFollowingDeviceGeoLocation,
      });
      map?.setView(mapRef.current.center);

      console.log("try invalidateSize");
      map?.invalidateSize();

      return () => {
        map.off({
          dragstart: stopFollowingDeviceGeoLocation,
          dragend: stopFollowingDeviceGeoLocation,
        });
      };
    }
  }, [map]);

  const onClickJumpToMyLocation = useCallback(() => {
    if (geoPermission === "granted") {
      mapRef.current.map?.flyTo(geolocation);
      mapRef.current = {
        ...mapRef.current,
        center: geolocation,
        isFollow: true,
      };
    } else if (geoPermission !== "denied") {
      // ask for loading geolocation
      mapRef.current = {
        ...mapRef.current,
        isFollow: true,
      };
      updateGeoPermission("opening");
    }
  }, [geoPermission, geolocation, updateGeoPermission]);

  const stopMarkers = useMemo(() => {
    // plot stops
    return stops.map((stop, idx) => (
      <Marker
        key={`${stop.location.lng}-${stop.location.lat}-${idx}`}
        position={stop.location}
        icon={BusStopMarker({
          active: idx === stopIdx,
          passed: idx < stopIdx,
        })}
        alt={`${idx}. ${stop.name[i18n.language]}`}
        eventHandlers={{
          click: (e) => {
            onMarkerClick(idx, e);
          },
        }}
      />
    ));
  }, [i18n.language, onMarkerClick, stopIdx, stops]);

  const lines = useMemo(() => {
    const list: JSX.Element[] = [];
    return stops.reduce((prev, stop, idx, stops) => {
      if (idx === 0) {
        return prev;
      }
      const lastStop = stops[idx - 1];
      if (lastStop === undefined) {
        console.log("wat?", stops, idx);
        return prev;
      }
      prev.push(
        <Polyline
          key={`${stop.location.lng}-${stop.location.lat}-line-${idx}`}
          positions={[getPoint(lastStop.location), getPoint(stop.location)]}
          color={"#FF9090"}
        />
      );
      return prev;
    }, list);
  }, [stops]);

  return (
    <Box id="route-map" sx={rootSx}>
      <MapContainer
        center={mapRef.current.initialCenter}
        zoom={16}
        scrollWheelZoom={false}
        className={classes.mapContainer}
        ref={setMap}
      >
        <TileLayer
          crossOrigin="anonymous"
          detectRetina
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
        {stopMarkers}
        {lines}
        <SelfCircle />
        <CenterControl onClick={onClickJumpToMyLocation} />
      </MapContainer>
    </Box>
  );
};

export default RouteMap;

const getPoint = ({ lat, lng }) => [lat, lng];

const BusStopMarker = ({ active, passed }) => {
  return Leaflet.divIcon({
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    className: `${classes.marker} ${active ? classes.active : ""} ${
      passed ? classes.passed : ""
    }`,
  });
};

const PREFIX = "routeMap";

const classes = {
  mapContainerBox: `${PREFIX}-mapContainerBox`,
  mapContainer: `${PREFIX}-mapContainer`,
  centerControl: `${PREFIX}-centerControl`,
  marker: `${PREFIX}-marker`,
  active: `${PREFIX}-active`,
  passed: `${PREFIX}-passed`,
};

const rootSx: SxProps<Theme> = {
  height: "30vh",
  filter: (theme) =>
    theme.palette.mode === "dark" ? "brightness(0.8)" : "none",
  [`& .${classes.mapContainer}`]: {
    height: "30vh",
  },
  [`& .${classes.marker}`]: {
    width: "25px",
    height: "41px",
    zIndex: 618,
    outline: "none",
    filter: "hue-rotate(130deg)",
    backgroundImage: `url(${markerIcon2X})`,
    backgroundSize: "cover",
  },
  [`& .${classes.active}`]: {
    animation: "blinker 2s linear infinite",
  },
  [`& .${classes.passed}`]: {
    filter: "grayscale(100%)",
  },
};

const centerControlSx: SxProps<Theme> = {
  background: "white",
  height: "28px",
  marginBottom: "20px !important",
  marginRight: "5px !important",
  [`& .${classes.centerControl}`]: {
    padding: "5px",
    color: "black",
  },
};
