import { useContext, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet'
import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../../AppContext'
import MyLocationIcon from '@material-ui/icons/MyLocation';

const ChangeMapCenter = ( {center, zoom} ) => {
  const map = useMap()
  map.flyTo(checkPosition(center))
  return <></>
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

const RouteMap = ({stops, stopList, stopIdx, onMarkerClick}) => {
  const { geolocation, geoPermission } = useContext ( AppContext )
  const classes = useStyles()
  const [center, setCenter] = useState(stopList[stops[stopIdx]] ? stopList[stops[stopIdx]].location : {})
  
  useEffect ( () => {
    setCenter(stopList[stops[stopIdx]] ? stopList[stops[stopIdx]].location : {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopIdx])

  return (
    <Box className={`${classes.mapContainer}`}>
      <MapContainer center={checkPosition(center)} zoom={16} scrollWheelZoom={false} className={classes.mapContainer}>
        <ChangeMapCenter center={checkPosition(center)} zoom={16} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {
          // plot stops
          stops.map((stopId, idx, self) => 
              <Marker 
                key={stopId} 
                position={stopList[stopId].location} 
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
              color={'#e55074'}
            />
          )
        }
        { geoPermission !== 'granted' ? <></>:<Circle 
          center={checkPosition(geolocation)}
          radius={25}
        />}
        <CenterControl 
          onClick={() => setCenter(geolocation)}
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

const useStyles = makeStyles ( theme => ({
  mapContainer: {
    height: '30vh',
    '& .leaflet-marker-pane': {
      filter: 'hue-rotate(130deg)' // tricky color change to marker
    }
  },
  centerControl: {
    padding: '5px',
  },
  centerControlContainer: {
    background: 'white',
    height: '28px',
    marginBottom: '20px !important',
    marginRight: '5px !important'
  }
}) )