import { useContext, useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, Polyline, Circle, useMap } from 'react-leaflet'
import Leaflet from 'leaflet'
import { useTranslation } from 'react-i18next'
import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../../AppContext'
import MyLocationIcon from '@material-ui/icons/MyLocation'
import { checkPosition } from '../../utils'

const ChangeMapCenter = ( {center, start, end} ) => {
  const map = useMap()
  if ( center )
    map.flyTo(checkPosition(center))
  else if ( end ) 
    map.fitBounds(Leaflet.latLngBounds(Leaflet.latLng(start.lat, start.lng), Leaflet.latLng(end.lat, end.lng)))
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

const StartMarker = ({start}) => {
  if ( start ) {
    return (
      <Marker 
        position={start}
        icon={EndsMarker({isStart: true})}
      />
    )
  }
  return null
}

const EndMarker = ({end}) => {
  if ( end ) {
    return (
      <Marker 
        position={end}
        icon={EndsMarker({isStart: false})}
      />
    )
  }
  return null
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

const BusRoute = ( {route: {routeId, on, off}, lv, stopIdx, onMarkerClick} ) => {
  const { db: {routeList, stopList} } = useContext ( AppContext )
  const { i18n } = useTranslation()
  const stops = Object.values(routeList[routeId].stops).sort((a,b) => b.length - a.length)[0].slice(on, off+1)
  const routeNo = routeId.split('-')[0]
  
  return (
    <>
    {
      stops.map((stopId, idx) => 
        <Marker 
          key={`${stopId}-${idx}`} 
          position={stopList[stopId].location} 
          icon={BusStopMarker({active: stopIdx === idx, passed: idx < stopIdx, lv})}
          alt={`${idx}. ${routeNo} - ${stopList[stopId].name[i18n.language]}`}
          eventHandlers={{
            click: (e) => {onMarkerClick(routeId, idx)}
          }}
        />
      )
    }
    {
      stops.slice(1).map((stopId, idx) => 
        <Polyline 
          key={`${stopId}-line`}
          positions={[
            getPoint(stopList[stops[idx]].location),
            getPoint(stopList[stopId].location)
          ]}
          color={lv === 0 ? '#FF9090' : '#d0b708'}
        />
      )
    }
    </>
  )
}

const Walklines = ({routes, start, end}) => {
  const { db: {routeList, stopList} } = useContext ( AppContext )
  const lines = []
  const points = []

  if ( !(start && end) ) return <></>
  
  points.push(start);
  (routes || []).forEach(({routeId, on, off}) => {
    const stops = Object.values(routeList[routeId].stops).sort((a,b) => b.length - a.length)[0]
    points.push(stopList[stops[on]].location)
    points.push(stopList[stops[off]].location)
  })
  points.push(end || start)
  for ( var i=0; i< points.length / 2; ++i ) {
    lines.push([points[i*2], points[i*2+1]])
  }
  
  return (
    <>
      {
        lines.map( (line, idx) => 
          <Polyline 
            key={`line-${idx}`}
            positions={[getPoint(line[0]),getPoint(line[1])]}
            color={'green'}
          />
        )
      }
    </>
  )
}

const SearchMap = ({routes, start, end, stopIdx, onMarkerClick}) => {
  const { geolocation, geoPermission, updateGeoPermission, colorMode } = useContext ( AppContext )
  useStyles()
  const [mapState, setMapState] = useState({
    center: null,
    isFollow: false
  })
  const {center, isFollow} = mapState
  const [map, setMap] = useState(null)

  const updateCenter = ({center, isFollow = false}) => {
    setMapState({
      center: center ? center : map.getCenter(),      
      isFollow: isFollow
    })
  }

  const getMapCenter = () => {
    if ( center ) return center
    
    if ( start && end ) {
      return {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2
      }
    }
    return checkPosition(start)
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
    if ( isFollow ) {
      if ( geolocation.lat !== center.lat || geolocation.lng !== center.lng )
        updateCenter({center: geolocation, isFollow: true})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation])

  return (
    <Box className={"routeMap-mapContainer"}>
      <MapContainer 
        center={getMapCenter()} 
        zoom={16} 
        scrollWheelZoom={false} 
        className={"routeMap-mapContainer"}
        whenCreated={setMap}
      >
        <ChangeMapCenter center={center} start={checkPosition(start)} end={end} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={colorMode === 'dark' ? 
            "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png" : 
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />
        { 
          (routes || []).map((route, idx) => <BusRoute key={`route-${idx}`} route={route} lv={idx} stopIdx={stopIdx[idx]} onMarkerClick={onMarkerClick} />)
        }
        <Walklines routes={routes} start={start} end={end} />
        <SelfCircle />
        <StartMarker start={start} />
        <EndMarker end={end} />
        <CenterControl 
          onClick={() => {
            if (geoPermission === 'granted') {
              // load from cache to avoid unintentional re-rending 
              // becoz geolocation is updated frequently 
              updateCenter({center: checkPosition(geolocation), isFollow: true})
            } else if ( geoPermission !== 'denied' ) {
              // ask for loading geolocation
              updateCenter({isFollow: true})
              updateGeoPermission('opening')
            }
          }}
        />
      </MapContainer>
    </Box>
  )
}

export default SearchMap

const getPoint = ({lat, lng}) => [lat, lng]

const BusStopMarker = ( {active, passed, lv} ) => {
  return Leaflet.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png',
    className: `${"routeMap-marker"} ${active ? "routeMap-active" : ''} ${passed ? "routeMap-passed" : ''} routeMap-marker-${lv}`,
  })
}

const EndsMarker = ( {isStart} ) => {
  return Leaflet.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png',
    className: `${"routeMap-marker"} ${isStart ? "routeMap-start" : 'routeMap-end'}`
  })
}

const useStyles = makeStyles ( theme => ({
  "@global": {
    ".routeMap-mapContainer": {
      height: '30vh',
      filter: theme.palette.type === 'dark' ? 'brightness(0.9)' : 'none'
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
    ".routeMap-marker-1": {
      filter: 'hue-rotate(210deg) brightness(1.5)'
    },
    ".routeMap-active": {
      animation: '$blinker 2s linear infinite'
    },
    ".routeMap-passed": {
      filter: 'grayscale(100%)'
    },
    ".routeMap-start": {
      filter: 'hue-rotate(30deg)'
    },
    ".routeMap-end": {
      filter: 'hue-rotate(280deg)'
    },
    "@keyframes blinker": {
      '50%': {
        opacity: 0.3
      }
    }
  },
}) )
