import { useContext, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Circle, useMap } from 'react-leaflet'
import Marker from 'react-leaflet-enhanced-marker'
import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../../AppContext'
import MyLocationIcon from '@material-ui/icons/MyLocation'

const ChangeMapCenter = ( {center, zoom} ) => {
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
  const classes = useStyles()
  return (
    <div className='leaflet-bottom leaflet-right'>
      <div 
        className={`${classes.centerControlContainer} leaflet-control leaflet-bar`}
        onClick={onClick}
      >
        <MyLocationIcon className={classes.centerControl} />
      </div>
    </div>
  )
}

const RouteMap = ({stops, stopIdx, onMarkerClick}) => {
  const { stopList, geoPermission, setGeoPermission, setGeolocation } = useContext ( AppContext )
  const classes = useStyles()
  const [center, setCenter] = useState(stopList[stops[stopIdx]] ? stopList[stops[stopIdx]].location : {})
  const [map, setMap] = useState(null)

  useEffect ( () => {
    setCenter(stopList[stops[stopIdx]] ? stopList[stops[stopIdx]].location : 
      stopList[stops[Math.round(stops.length/2)]].location
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopIdx])

  const updateCenter = (e) => {
    setCenter(map.getCenter())
  }

  useEffect ( () => {
    if ( !map ) return
    map.on('dragend', updateCenter)
    return () => {
      map.off('dragend', updateCenter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  return (
    <Box className={`${classes.mapContainer}`}>
      <MapContainer 
        center={checkPosition(center)} 
        zoom={16} 
        scrollWheelZoom={false} 
        className={classes.mapContainer}
        whenCreated={setMap}
      >
        <ChangeMapCenter center={checkPosition(center)} zoom={16} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {
          // plot stops
          stops.map((stopId, idx, self) => 
              <Marker 
                key={`${stopId}-${idx}`} 
                position={stopList[stopId].location} 
                icon={<BusStopMarker active={idx === stopIdx} passed={idx < stopIdx} />}
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
            if (geoPermission === 'granted') {
              // load from cache to avoid unintentional re-rending 
              // becoz geolocation is updated frequently 
              setCenter(checkPosition(JSON.parse(localStorage.getItem('geolocation'))))
            } else if ( geoPermission !== 'denied' ) {
              // ask for loading geolocation
              navigator.geolocation.getCurrentPosition(({coords: {latitude, longitude}}) => {
                setGeolocation( {lat: latitude, lng: longitude} )
                setCenter( {lat: latitude, lng: longitude} )
                setGeoPermission('granted')
              })
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
  const classes = useStyles()
  return (
    <img 
      src="https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon.png"
      alt="" 
      tabIndex="0" 
      className={`${classes.marker} ${active ? classes.active : ''}`}
      style={{
        filter: passed ? 'grayscale(100%)' : 'hue-rotate(130deg)',
      }}
    />
  )
}

const useStyles = makeStyles ( theme => ({
  mapContainer: {
    height: '30vh'
  },
  centerControl: {
    padding: '5px',
  },
  centerControlContainer: {
    background: 'white',
    height: '28px',
    marginBottom: '20px !important',
    marginRight: '5px !important'
  },
  marker: {
    marginLeft: '38px',
    marginTop: '-14px',
    width: '25px',
    height: '41px',
    zIndex: 618,
    outline: 'none'
  },
  active: {
    animation: '$blinker 2s linear infinite'
  },
  "@keyframes blinker": {
    '50%': {
      opacity: 0.3
    }
  }
}) )
