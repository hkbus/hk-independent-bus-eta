import {
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react";
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
import { getLineColor } from "../../utils";

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
  stopIds: string[];
  stopIdx: number;
  route: string;
  companies: Company[];
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
  stopIds,
  stopIdx,
  route,
  companies,
  onMarkerClick,
}: RouteMapProps) => {
  const {
    geolocation,
    geoPermission,
    updateGeoPermission,
    colorMode,
    db: { stopList },
  } = useContext(AppContext);
  const { i18n } = useTranslation();
  const [map, setMap] = useState<Leaflet.Map>(null);
  const stops = useMemo(
    () => stopIds.map((stopId) => stopList[stopId]),
    [stopList, stopIds]
  );
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
              companies,
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
              style={geoJsonStyle(companies, route)}
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

const geoJsonStyle = (companies, route) => {
  return function (feature: GeoJSON.Feature) {
    return {
      color: getLineColor(companies, route),
      weight: 4,
    };
  };
};

interface StopMarkerProps {
  active: boolean;
  passed: boolean;
  companies: Company[];
}

const StopMarker = ({ active, passed, companies }: StopMarkerProps) => {
  if (companies[0] === "mtr") {
    return Leaflet.divIcon({
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: `${classes.mtrMarker} ${classes.marker} ${
        active ? classes.active : ""
      } ${passed ? classes.passed : ""}`,
    });
  } else if (companies.includes("lightRail")) {
    return Leaflet.divIcon({
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: `${classes.mtrMarker} ${classes.marker} ${
        active ? classes.active : ""
      } ${passed ? classes.passed : ""}`,
    });
  } else if (companies[0].startsWith("gmb")) {
    return Leaflet.divIcon({
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      className: `${classes.gmbMarker} ${classes.marker} ${
        active ? classes.active : ""
      } ${passed ? classes.passed : ""}`,
    });
  } else if (companies.includes("lrtfeeder")) {
    return Leaflet.divIcon({
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      className: `${classes.lrtfeederMarker} ${classes.marker} ${
        active ? classes.active : ""
      } ${passed ? classes.passed : ""}`,
    });
  } else if (companies.includes("nlb")) {
    return Leaflet.divIcon({
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      className: `${classes.nlbMarker} ${classes.marker} ${
        active ? classes.active : ""
      } ${passed ? classes.passed : ""}`,
    });
  } else if (companies.includes("ctb") && companies.includes("kmb")) {
    return Leaflet.divIcon({
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      className: `${classes.jointlyMarker} ${classes.marker} ${
        active ? classes.active : ""
      } ${passed ? classes.passed : ""}`,
    });
  } else if (companies.includes("ctb")) {
    return Leaflet.divIcon({
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      className: `${classes.ctbMarker} ${classes.marker} ${
        active ? classes.active : ""
      } ${passed ? classes.passed : ""}`,
    });
  }
  return Leaflet.divIcon({
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    className: `${classes.kmbMarker} ${classes.marker} ${
      active ? classes.active : ""
    } ${passed ? classes.passed : ""}`,
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
  ctbMarker: `${PREFIX}-ctbMarker`,
  jointlyMarker: `${PREFIX}-jointlyMarker`,
  lrtfeederMarker: `${PREFIX}-lrtfeederMarker`,
  nlbMarker: `${PREFIX}-nlbMarker`,
  kmbMarker: `${PREFIX}-kmbMarker`,
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
  [`& .${classes.mtrMarker}`]: {
    backgroundImage: `url(/img/mtr.svg)`,
  },
  [`& .${classes.gmbMarker}`]: {
    backgroundImage: `url(/img/minibus.svg)`,
  },
  [`& .${classes.ctbMarker}`]: {
    backgroundImage: `url(/img/bus_ctb.svg)`,
  },
  [`& .${classes.jointlyMarker}`]: {
    backgroundImage: `url(/img/bus_jointly.svg)`,
  },
  [`& .${classes.lrtfeederMarker}`]: {
    backgroundImage: `url(/img/bus_lrtfeeder.svg)`,
  },
  [`& .${classes.nlbMarker}`]: {
    backgroundImage: `url(/img/bus_nlb.svg)`,
  },
  [`& .${classes.kmbMarker}`]: {
    backgroundImage: `url(/img/bus_kmb.svg)`,
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
