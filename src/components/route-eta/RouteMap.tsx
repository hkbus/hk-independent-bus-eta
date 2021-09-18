import { useContext, useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Polyline,
  Circle,
} from "react-leaflet";
import Leaflet from "leaflet";
import markerIcon2X from "leaflet/dist/images/marker-icon-2x.png";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import type { StopEntry } from "../../DbContext";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import { checkPosition } from "../../utils";
import type { Map as LeafletMap } from "leaflet";

const SelfCircle = () => {
  const { geolocation, geoPermission } = useContext(AppContext);
  if (geoPermission !== "granted") {
    return null;
  }
  return <Circle center={checkPosition(geolocation)} radius={25} />;
};

const CenterControl = ({ onClick }) => {
  useStyles();
  return (
    <div className="leaflet-bottom leaflet-right">
      <div
        className={`${"routeMap-centerControlContainer"} leaflet-control leaflet-bar`}
        onClick={onClick}
      >
        <MyLocationIcon className={"routeMap-centerControl"} />
      </div>
    </div>
  );
};

interface RouteMapProps {
  stops: Array<StopEntry>;
  stopIdx: number;
  onMarkerClick: (idx: number, event: unknown) => void
}

const RouteMap = ({ stops, stopIdx, onMarkerClick }: RouteMapProps) => {
  const {
    geolocation,
    geoPermission,
    updateGeoPermission,
    colorMode,
  } = useContext(AppContext);
  const [mapState, setMapState] = useState({
    center: stops[stopIdx] ? stops[stopIdx].location : checkPosition(),
    isFollow: false,
  });
  const { center } = mapState;
  const { i18n } = useTranslation();
  const mapRef = useRef<LeafletMap>(null);

  useEffect(() => {
    const _center = stops[stopIdx] ? stops[stopIdx].location : checkPosition();
    setMapState((state) => {
      if (_center.lat !== state.center.lat || _center.lng !== state.center.lng) {
        if (mapRef != null) {
          mapRef.current.flyTo(_center);
        }
        return {
          ...state,
          center: _center,
          isFollow: false
        }
      }
      return state;
    })
  }, [stops, stopIdx]);

  useEffect(() => {
    setMapState((state) => {
      if (state.isFollow) {
        if (
          geolocation.lat !== state.center.lat ||
          geolocation.lng !== state.center.lng
        ) {
          if (mapRef.current != null) {
            mapRef.current.flyTo(geolocation);
          }
          return { center: geolocation, isFollow: true };
        }
      }
      return state;
    });
  }, [geolocation]);

  const whenCreated = useCallback(
    (map: LeafletMap) => {
      console.log("got map", map);
      mapRef.current = map;
      map.on({
        dragend: () => {
          setMapState({
            center: map.getCenter(),
            isFollow: false,
          });
        },
      });
      if (navigator.userAgent === "prerendering") {
        map.setView(checkPosition(center), 11);
      } else {
        map.flyTo(checkPosition(center));
      }
      setTimeout(() => {
        console.log("try invalidateSize");
        map.invalidateSize();
      }, 500);
    },
    [center]
  );

  const whenReady = useCallback(() => {
    console.log("map is ready");
  }, []);

  const onClickJumpToMyLocation = useCallback(() => {
    if (geoPermission === "granted") {
      // load from cache to avoid unintentional re-rending
      // becoz geolocation is updated frequently
      setMapState({
        center: checkPosition(geolocation),
        isFollow: true,
      });
      if (mapRef.current != null) {
        mapRef.current.flyTo(geolocation);
      }
    } else if (geoPermission !== "denied") {
      // ask for loading geolocation
      setMapState((state) => ({ ...state, isFollow: true }));
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
    ))
  }, [i18n.language, onMarkerClick, stopIdx, stops])

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
      prev.push(<Polyline
        key={`${stop.location.lng}-${stop.location.lat}-line`}
        positions={[
          getPoint(lastStop.location),
          getPoint(stop.location),
        ]}
        color={"#FF9090"}
      />)
      return prev;
    }, list);
  }, [stops])
  console.log(checkPosition(center))
  return (
    <Box className={"routeMap-mapContainer"}>
      <MapContainer
        center={checkPosition(center)}
        zoom={16}
        scrollWheelZoom={false}
        className={"routeMap-mapContainer"}
        whenCreated={whenCreated}
        whenReady={whenReady}
      >
        <TileLayer
          crossOrigin="anonymous"
          detectRetina
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
  return Leaflet.icon({
    iconUrl: markerIcon2X,
    className: `${"routeMap-marker"} ${active ? "routeMap-active" : ""} ${
      passed ? "routeMap-passed" : ""
    }`,
  });
};

const useStyles = makeStyles((theme) => ({
  "@global": {
    ".routeMap-mapContainer": {
      height: "30vh",
      filter: theme.palette.type === "dark" ? "brightness(0.9)" : "none",
    },
    ".routeMap-centerControl": {
      padding: "5px",
      color: "black",
    },
    ".routeMap-centerControlContainer": {
      background: "white",
      height: "28px",
      marginBottom: "20px !important",
      marginRight: "5px !important",
    },
    ".routeMap-marker": {
      marginLeft: "-12px",
      marginTop: "-41px",
      width: "25px",
      height: "41px",
      zIndex: 618,
      outline: "none",
      filter: "hue-rotate(130deg)",
    },
    ".routeMap-active": {
      animation: "$blinker 2s linear infinite",
    },
    ".routeMap-passed": {
      filter: "grayscale(100%)",
    },
    "@keyframes blinker": {
      "50%": {
        opacity: 0.3,
      },
    },
  },
}));
