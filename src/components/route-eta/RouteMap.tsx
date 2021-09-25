import { useContext, useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import Leaflet from "leaflet";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { checkPosition } from "../../utils";
import { Location } from "hk-bus-eta";

const ChangeMapCenter = ({ center }) => {
  const map = useMap();
  if (navigator.userAgent === "prerendering") {
    map.setView(checkPosition(center), 11);
  } else {
    map.flyTo(checkPosition(center));
  }
  return <></>;
};

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
      <CenterControlRoot
        className={`${classes.centerControlContainer} leaflet-control leaflet-bar`}
        onClick={onClick}
      >
        <MyLocationIcon className={classes.centerControl} />
      </CenterControlRoot>
    </div>
  );
};

const RouteMap = ({ stops, stopIdx, onMarkerClick }) => {
  const {
    db: { stopList },
    geolocation,
    geoPermission,
    updateGeoPermission,
    colorMode,
  } = useContext(AppContext);
  const [mapState, setMapState] = useState({
    center: stopList[stops[stopIdx]]
      ? stopList[stops[stopIdx]].location
      : stopList[stops[Math.round(stops.length / 2)]].location,
    isFollow: false,
  });
  const { center, isFollow } = mapState;
  const { i18n } = useTranslation();
  const [map, setMap] = useState(null);

  const updateCenter = ({
    center,
    isFollow = false,
  }: {
    center?: Location;
    isFollow?: boolean;
  }) => {
    setMapState({
      center: center ? center : map.getCenter(),
      isFollow: isFollow,
    });
  };

  useEffect(() => {
    const _center = stopList[stops[stopIdx]]
      ? stopList[stops[stopIdx]].location
      : stopList[stops[Math.round(stops.length / 2)]].location;
    if (_center.lat !== center.lat || _center.lng !== center.lng) {
      updateCenter({ center: _center });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, stopIdx]);

  useEffect(() => {
    if (!map) return;
    map.on("dragend", updateCenter);
    return () => {
      map.off("dragend", updateCenter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (isFollow) {
      if (geolocation.lat !== center.lat || geolocation.lng !== center.lng)
        updateCenter({ center: geolocation, isFollow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation]);

  return (
    <RouteMapBox className={classes.mapContainerBox}>
      <MapContainer
        center={checkPosition(center)}
        zoom={16}
        scrollWheelZoom={false}
        className={classes.mapContainer}
        whenCreated={setMap}
      >
        <ChangeMapCenter center={checkPosition(center)} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            colorMode === "dark"
              ? "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />
        {
          // plot stops
          stops.map((stopId, idx) => (
            <Marker
              key={`${stopId}-${idx}`}
              position={stopList[stopId].location}
              icon={BusStopMarker({
                active: idx === stopIdx,
                passed: idx < stopIdx,
              })}
              alt={`${idx}. ${stopList[stopId].name[i18n.language]}`}
              eventHandlers={{
                click: (e) => {
                  onMarkerClick(idx)(e, true, true);
                },
              }}
            />
          ))
        }
        {
          // plot line
          stops.slice(1).map((stopId, idx) => (
            <Polyline
              key={`${stopId}-line`}
              positions={[
                getPoint(stopList[stops[idx]].location),
                getPoint(stopList[stopId].location),
              ]}
              color={"#FF9090"}
            />
          ))
        }
        <SelfCircle />
        <CenterControl
          onClick={() => {
            if (geoPermission === "granted") {
              // load from cache to avoid unintentional re-rending
              // becoz geolocation is updated frequently
              updateCenter({
                center: checkPosition(geolocation),
                isFollow: true,
              });
            } else if (geoPermission !== "denied") {
              // ask for loading geolocation
              updateCenter({ isFollow: true });
              updateGeoPermission("opening");
            }
          }}
        />
      </MapContainer>
    </RouteMapBox>
  );
};

export default RouteMap;

const getPoint = ({ lat, lng }) => [lat, lng];

const BusStopMarker = ({ active, passed }) => {
  return Leaflet.icon({
    iconUrl: "https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png",
    className: `${classes.marker} ${active ? classes.active : ""} ${
      passed ? classes.passed : ""
    }`,
  });
};

const PREFIX = "routeMap";

const classes = {
  mapContainerBox: `${PREFIX}-mapContainerBox`,
  mapContainer: `${PREFIX}-mapContainer`,
  centerControlContainer: `${PREFIX}-centerControlContainer`,
  centerControl: `${PREFIX}-centerControl`,
  marker: `${PREFIX}-marker`,
  active: `${PREFIX}-active`,
  passed: `${PREFIX}-passed`,
};

const RouteMapBox = styled(Box)(({ theme }) => ({
  [`&.${classes.mapContainerBox}`]: {
    height: "30vh",
    filter: theme.palette.mode === "dark" ? "brightness(0.8)" : "none",
  },
  [`& .${classes.mapContainer}`]: {
    height: "30vh",
  },
  [`& .${classes.marker}`]: {
    marginLeft: "-12px",
    marginTop: "-41px",
    width: "25px",
    height: "41px",
    zIndex: 618,
    outline: "none",
    filter: "hue-rotate(130deg)",
  },
  [`& .${classes.active}`]: {
    animation: "blinker 2s linear infinite",
  },
  [`& .${classes.passed}`]: {
    filter: "grayscale(100%)",
  },
}));

const CenterControlRoot = styled("div")(({ theme }) => ({
  [`& .${classes.centerControl}`]: {
    padding: "5px",
    color: "black",
  },
  [`&.${classes.centerControlContainer}`]: {
    background: "white",
    height: "28px",
    marginBottom: "20px !important",
    marginRight: "5px !important",
  },
}));
