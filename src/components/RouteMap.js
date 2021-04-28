import { useContext } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet'
import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../AppContext'

const ChangeMapCenter =  ( {center, zoom} ) => {
  const map = useMap()
  map.setView( checkPosition(center), 16)
  return <></>
}

const RouteMap = ({stops, stopList, position}) => {
  const { geolocation, geoPermission } = useContext ( AppContext )
  const classes = useStyles()

  return (
    <Box className={`${classes.mapContainer} map`}>
      <MapContainer center={checkPosition(position)} zoom={16} scrollWheelZoom={false} className={classes.mapContainer}>
        <ChangeMapCenter center={checkPosition(position)} zoom={16} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {
          // plot stops
          stops.map((stopId, idx, self) => 
              <Marker key={stopId} position={stopList[stopId].location} />  
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
            />
          )
        }
        { geoPermission !== 'granted' ? <></>:<Circle 
          center={checkPosition(geolocation)}
          radius={25}
        />}
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
  }
}) )