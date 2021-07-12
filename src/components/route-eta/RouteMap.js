import { useContext, useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, Polyline, Circle, useMap } from 'react-leaflet'
import Leaflet from 'leaflet'
import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../../AppContext'
import MyLocationIcon from '@material-ui/icons/MyLocation'

const ChangeMapCenter = ( {center} ) => {
  const map = useMap()
  map.flyTo(checkPosition(center))
  return <></>
}

const SelfCircle = () => {
  const { geolocation, geoPermission } = useContext ( AppContext )
  if ( geoPermission !== 'granted' ) {
    return null
  }
  return (
    <Circle 
      center={checkPosition(geolocation)}
      radius={25}
    />
  )
}

const CenterControl = ( {onClick}) => {
  useStyles()
  return (
    <div className='leaflet-bottom leaflet-right'>
      <div 
        className={`${"routeMap-centerControlContainer"} leaflet-control leaflet-bar`}
        onClick={onClick}
      >
        <MyLocationIcon className={"routeMap-centerControl"} />
      </div>
    </div>
  )
}

const RouteMap = ({stops, stopIdx, onMarkerClick}) => {
  const { db: {stopList}, geolocation, geoPermission, updateGeoPermission, colorMode } = useContext ( AppContext )
  useStyles()
  const [center, setCenter] = useState(stopList[stops[stopIdx]] ? stopList[stops[stopIdx]].location : {})
  const [followCenter, setFollowCenter] = useState(false)
  const [map, setMap] = useState(null)

  useEffect ( () => {
    setCenter(stopList[stops[stopIdx]] ? stopList[stops[stopIdx]].location : 
      stopList[stops[Math.round(stops.length/2)]].location
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopIdx])

  const updateCenter = (e) => {
    setCenter(map.getCenter())
    setFollowCenter(false)
  }

  useEffect ( () => {
    if ( !map ) return;
    map.on('dragend', updateCenter)
    return () => {
      map.off('dragend', updateCenter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  useEffect( () => {
    if ( followCenter ) {
      setCenter(geolocation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation])

  return (
    <Box className={"routeMap-mapContainer"}>
      <MapContainer 
        center={checkPosition(center)} 
        zoom={16} 
        scrollWheelZoom={false} 
        className={"routeMap-mapContainer"}
        whenCreated={setMap}
      >
        <ChangeMapCenter center={checkPosition(center)} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={colorMode === 'dark' ? 
            "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png" : 
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />
        {
          // plot stops
          stops.map((stopId, idx, self) => 
              <Marker 
                key={`${stopId}-${idx}`} 
                position={stopList[stopId].location} 
                icon={BusStopMarker({active: idx === stopIdx, passed: (idx < stopIdx)})}
                eventHandlers={{
                  click: (e) => {onMarkerClick(idx)(e, true, true)}
                }}
              />
          )
        }
        {
          // plot line
          stops.slice(1).map((stopId, idx) => 
            <Polyline 
              key={`${stopId}-line`}
              positions={[
                getPoint(stopList[stops[idx]].location),
                getPoint(stopList[stopId].location)
              ]}
              color={'#FF9090'}
            />
          )
        }
        <SelfCircle />
        <CenterControl 
          onClick={() => {
            setFollowCenter(true)
            if (geoPermission === 'granted') {
              // load from cache to avoid unintentional re-rending 
              // becoz geolocation is updated frequently 
              setCenter(checkPosition(geolocation))
            } else if ( geoPermission !== 'denied' ) {
              // ask for loading geolocation
              updateGeoPermission('opening')
            }
          }}
        />
      </MapContainer>
    </Box>
  )
}

export default RouteMap

// HK location if no valid value
const checkPosition = (position) => {
  if ( position 
    && typeof position.lat === 'number' && isFinite(position.lat)
    && typeof position.lng === 'number' && isFinite(position.lng) 
  )
    return position
  return {lat: 22.302711, lng: 114.177216}
}

const getPoint = ({lat, lng}) => [lat, lng]

const BusStopMarker = ( {active, passed} ) => {
  return Leaflet.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png',
    className: `${"routeMap-marker"} ${active ? "routeMap-active" : ''} ${passed ? "routeMap-passed" : ''}`
  })
}

const useStyles = makeStyles ( theme => ({
  "@global": {
    ".routeMap-mapContainer": {
      height: '30vh'
    },
    ".routeMap-centerControl": {
      padding: '5px',
      color: 'black'
    },
    ".routeMap-centerControlContainer": {
      background: 'white',
      height: '28px',
      marginBottom: '20px !important',
      marginRight: '5px !important'
    },
    ".routeMap-marker": {
      marginLeft: '-12px',
      marginTop: '-41px',
      width: '25px',
      height: '41px',
      zIndex: 618,
      outline: 'none',
      filter: 'hue-rotate(130deg)'
    },
    ".routeMap-active": {
      animation: '$blinker 2s linear infinite'
    },
    ".routeMap-passed": {
      filter: 'grayscale(100%)'
    },
    "@keyframes blinker": {
      '50%': {
        opacity: 0.3
      }
    }
  },
}) )
