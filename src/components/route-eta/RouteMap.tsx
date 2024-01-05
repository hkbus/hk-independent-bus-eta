import { useContext, useEffect, useRef, useCallback, useState } from "react";
import { MapContainer, Marker, TileLayer, GeoJSON } from "react-leaflet";
import Leaflet from "leaflet";
import { Box, SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { type Company } from "hk-bus-eta";
import AppContext from "../../AppContext";
import type { StopListEntry } from "hk-bus-eta";
import { MyLocation as MyLocationIcon } from "@mui/icons-material";
import { checkPosition, locationEqual } from "../../utils";
import type { Map as LeafletMap } from "leaflet";
import type { Location as GeoLocation } from "hk-bus-eta";
import SelfCircle from "../map/SelfCircle";
import CompassControl from "../map/CompassControl";
import { useRoutePath } from "../../hooks/useRoutePath";

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
  routeId: string;
  stops: Array<StopListEntry>;
  stopIdx: number;
  co: Company;
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

const RouteMap = ({
  routeId,
  stops,
  stopIdx,
  co,
  onMarkerClick,
}: RouteMapProps) => {
  const { geolocation, geoPermission, updateGeoPermission, colorMode } =
    useContext(AppContext);
  const { i18n } = useTranslation();
  const [map, setMap] = useState<Leaflet.Map>(null);
  const routePath = useRoutePath(routeId, stops);
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
        {stops.map((stop, idx) => (
          <Marker
            key={`${stop.location.lng}-${stop.location.lat}-${idx}`}
            position={stop.location}
            icon={StopMarker({
              active: idx === stopIdx,
              passed: idx < stopIdx,
              co,
            })}
            alt={`${idx}. ${stop.name[i18n.language]}`}
            eventHandlers={{
              click: (e) => {
                onMarkerClick(idx, e);
              },
            }}
          />
        ))}
        {
          // @ts-ignore
          routePath?.features?.length && (
            <GeoJSON
              key={routePath?.["timeStamp"]}
              data={routePath}
              style={geoJsonStyle}
            />
          )
        }
        <SelfCircle />
        <CenterControl onClick={onClickJumpToMyLocation} />
        <CompassControl />
      </MapContainer>
    </Box>
  );
};

export default RouteMap;

const geoJsonStyle = function (feature: GeoJSON.Feature) {
  return {
    color: "#FF9090",
    weight: 4,
  };
};

const StopMarker = ({ active, passed, co }) => {
  if (co === "mtr") {
    return Leaflet.divIcon({
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: `${classes.mtrMarker} ${active ? classes.active : ""} ${
        passed ? classes.passed : ""
      }`,
    });
  }
  if (co.startsWith("gmb")) {
    return Leaflet.divIcon({
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      className: `${classes.gmbMarker} ${active ? classes.active : ""} ${
        passed ? classes.passed : ""
      }`,
    });
  }
  return Leaflet.divIcon({
    iconSize: [40, 40],
    iconAnchor: [20, 40],
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
  mtrMarker: `${PREFIX}-mtrMarker`,
  gmbMarker: `${PREFIX}-gmbMarker`,
  active: `${PREFIX}-active`,
  passed: `${PREFIX}-passed`,
};

const rootSx: SxProps<Theme> = {
  height: "35vh",
  filter: (theme) =>
    theme.palette.mode === "dark" ? "brightness(0.8)" : "none",
  [`& .${classes.mapContainer}`]: {
    height: "35vh",
  },
  [`& .${classes.marker}`]: {
    zIndex: 618,
    outline: "none",
    backgroundImage: `url(/img/bus.svg)`,
    backgroundSize: "cover",
  },
  [`& .${classes.mtrMarker}`]: {
    zIndex: 618,
    outline: "none",
    backgroundImage: `url(/img/mtr.svg)`,
    backgroundSize: "cover",
  },
  [`& .${classes.gmbMarker}`]: {
    zIndex: 618,
    outline: "none",
    backgroundImage: `url(/img/minibus.svg)`,
    backgroundSize: "cover",
  },
  [`& .${classes.active}`]: {
    animation: "blinker 1.5s infinite",
  },
  [`& .${classes.passed}`]: {
    filter: "grayscale(100%)",
  },
  [`& .self-center`]: {
    backgroundImage: "url(/img/self.svg)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    transition: "transform 0.1s ease-out",
    transformOrigin: "center",
  },
};

const centerControlSx: SxProps<Theme> = {
  background: "white",
  width: 32,
  height: 32,
  marginBottom: "20px !important",
  marginRight: "5px !important",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  [`& .${classes.centerControl}`]: {
    padding: "3px",
    color: "black",
  },
};
