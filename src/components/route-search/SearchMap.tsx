import { useCallback, useContext, useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import Leaflet, { LatLngExpression } from "leaflet";
import { Box, SxProps, Theme } from "@mui/material";
import AppContext from "../../context/AppContext";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { checkPosition } from "../../utils";
import { Location as GeoLocation } from "hk-bus-eta";
import SelfCircle from "../map/SelfCircle";
import CompassControl from "../map/CompassControl";
import useLanguage from "../../hooks/useTranslation";
import { SearchRoute } from "../../pages/RouteSearch";
import DbContext from "../../context/DbContext";

interface ChangeMapCenter {
  center: GeoLocation | null;
  start: GeoLocation;
  end: GeoLocation | null;
}

const ChangeMapCenter = ({ center, start, end }: ChangeMapCenter) => {
  const map = useMap();
  if (center) map.flyTo(checkPosition(center));
  else if (end)
    map.fitBounds(
      Leaflet.latLngBounds(
        Leaflet.latLng(start.lat, start.lng),
        Leaflet.latLng(end.lat, end.lng)
      )
    );
  return <></>;
};

const StartMarker = ({ start }: { start: GeoLocation }) => {
  if (start) {
    return <Marker position={start} icon={EndsMarker({ isStart: true })} />;
  }
  return null;
};

const EndMarker = ({ end }: { end: GeoLocation | null }) => {
  if (end) {
    return <Marker position={end} icon={EndsMarker({ isStart: false })} />;
  }
  return null;
};

interface CenterControlProps {
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

const CenterControl = ({ onClick }: CenterControlProps) => {
  return (
    <div className="leaflet-bottom leaflet-right">
      <Box
        sx={centerControlSx}
        className="leaflet-control leaflet-bar"
        onClick={onClick}
      >
        <MyLocationIcon className={classes.centralControl} />
      </Box>
    </div>
  );
};

interface BusRouteProps {
  route: SearchRoute;
  lv: number;
  stopIdx: number;
  onMarkerClick: (routeId: string, offset: number) => void;
}

const BusRoute = ({
  route: { routeId, on, off },
  lv,
  stopIdx,
  onMarkerClick,
}: BusRouteProps) => {
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);
  const language = useLanguage();
  const stops = Object.values(routeList[routeId].stops)
    .sort((a, b) => b.length - a.length)[0]
    .slice(on, off + 1);
  const routeNo = routeId.split("-")[0];

  return (
    <>
      {stops.map((stopId, idx) => (
        <Marker
          key={`${stopId}-${idx}`}
          position={stopList[stopId].location}
          icon={BusStopMarker({
            active: stopIdx === idx,
            passed: idx < stopIdx,
            lv,
          })}
          alt={`${idx}. ${routeNo} - ${stopList[stopId].name[language]}`}
          eventHandlers={{
            click: () => {
              onMarkerClick(routeId, idx);
            },
          }}
        />
      ))}
      {stops.slice(1).map((stopId, idx) => (
        <Polyline
          key={`${stopId}-line`}
          positions={[
            getPoint(stopList[stops[idx]].location),
            getPoint(stopList[stopId].location),
          ]}
          color={lv === 0 ? "#FF9090" : "#d0b708"}
        />
      ))}
    </>
  );
};

interface WalklinesProps {
  routes: SearchRoute[];
  start: GeoLocation | null;
  end: GeoLocation | null;
}

const Walklines = ({ routes, start, end }: WalklinesProps) => {
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);
  const lines = [];
  const points = [];

  if (!(start && end)) return <></>;

  points.push(start);
  (routes || []).forEach(({ routeId, on, off }) => {
    const stops = Object.values(routeList[routeId].stops).sort(
      (a, b) => b.length - a.length
    )[0];
    points.push(stopList[stops[on]].location);
    points.push(stopList[stops[off]].location);
  });
  points.push(end || start);
  for (let i = 0; i < points.length / 2; ++i) {
    lines.push([points[i * 2], points[i * 2 + 1]]);
  }

  return (
    <>
      {lines.map((line, idx) => (
        <Polyline
          key={`line-${idx}`}
          positions={[getPoint(line[0]), getPoint(line[1])]}
          color={"green"}
        />
      ))}
    </>
  );
};

interface SearchMapProps {
  routes: SearchRoute[];
  start: GeoLocation;
  end: GeoLocation | null;
  stopIdx: number[] | null;
  onMarkerClick: (routeId: string, offset: number) => void;
}

const SearchMap = ({
  routes,
  start,
  end,
  stopIdx,
  onMarkerClick,
}: SearchMapProps) => {
  const { geolocation, geoPermission, updateGeoPermission, colorMode } =
    useContext(AppContext);
  const [mapState, setMapState] = useState<{
    center: GeoLocation | null;
    isFollow: boolean;
  }>({
    center: null,
    isFollow: false,
  });
  const { center, isFollow } = mapState;
  const [map, setMap] = useState<Leaflet.Map | null>(null);

  const updateCenter = useCallback(
    (state?: { center?: GeoLocation; isFollow?: boolean }) => {
      const { center, isFollow } = state ?? {};
      setMapState({
        center: center || map?.getCenter() || null,
        isFollow: isFollow || false,
      });
    },
    [map, setMapState]
  );

  const getMapCenter = () => {
    if (center) return center;

    if (start && end) {
      return {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2,
      };
    }
    return checkPosition(start);
  };

  useEffect(() => {
    if (map) {
      const dragCallback = () => {
        updateCenter({
          center: map.getCenter(),
        });
      };

      map.on({
        dragend: dragCallback,
      });
      return () => {
        map.off({
          dragend: dragCallback,
        });
      };
    }
  }, [map, updateCenter]);

  useEffect(() => {
    if (isFollow) {
      if (
        !center ||
        geolocation.current.lat !== center.lat ||
        geolocation.current.lng !== center.lng
      )
        updateCenter({ center: geolocation.current, isFollow: true });
    }
  }, [geolocation, center, isFollow, updateCenter]);

  return (
    <Box sx={rootSx}>
      <MapContainer
        center={getMapCenter()}
        zoom={16}
        scrollWheelZoom={false}
        className={classes.mapContainer}
        ref={setMap}
      >
        <ChangeMapCenter
          center={center}
          start={checkPosition(start)}
          end={end}
        />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            colorMode === "dark"
              ? "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />
        {stopIdx !== null &&
          (routes || []).map((route, idx) => (
            <BusRoute
              key={`route-${idx}`}
              route={route}
              lv={idx}
              stopIdx={stopIdx[idx]}
              onMarkerClick={onMarkerClick}
            />
          ))}
        <Walklines routes={routes} start={start} end={end} />
        <SelfCircle />
        <StartMarker start={start} />
        <EndMarker end={end} />
        <CenterControl
          onClick={() => {
            if (geoPermission === "granted") {
              // load from cache to avoid unintentional re-rending
              // becoz geolocation is updated frequently
              updateCenter({ isFollow: true });
            } else if (geoPermission !== "denied") {
              // ask for loading geolocation
              updateCenter({ isFollow: true });
              updateGeoPermission("opening");
            }
          }}
        />
        <CompassControl />
      </MapContainer>
    </Box>
  );
};

export default SearchMap;

const getPoint = ({ lat, lng }: GeoLocation): LatLngExpression => [lat, lng];

interface BusStopMarkerProps {
  active: boolean;
  passed: boolean;
  lv: number;
}

const BusStopMarker = ({ active, passed, lv }: BusStopMarkerProps) => {
  return Leaflet.icon({
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    iconUrl: "https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png",
    className: `${classes.marker} ${active ? classes.active : ""} ${
      passed ? classes.passed : ""
    } lv-${lv}`,
  });
};

const EndsMarker = ({ isStart }: { isStart: boolean }) => {
  return Leaflet.icon({
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    iconUrl: "https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png",
    className: `${classes.marker} ${isStart ? "start" : "end"}`,
  });
};

const PREFIX = "searchMap";

const classes = {
  mapContainer: `${PREFIX}-mapContainer`,
  centralControl: `${PREFIX}-centralControl`,
  marker: `${PREFIX}-marker`,
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
    width: "40px",
    height: "40px",
    zIndex: 618,
    outline: "none",
    "&.lv-1": {
      filter: "hue-rotate(210deg) brightness(1.5)",
    },
    "&.start": {
      filter: "hue-rotate(30deg)",
    },
    "&.end": {
      filter: "hue-rotate(280deg)",
    },
  },
  [`& .${classes.active}`]: {
    animation: "blinker 2s cubic-bezier(0,1.5,1,1.5) infinite",
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

const centerControlSx = {
  background: "white",
  height: "28px",
  marginBottom: "20px !important",
  marginRight: "5px !important",
  [`& .${classes.centralControl}`]: {
    padding: "5px",
    color: "black",
  },
};
