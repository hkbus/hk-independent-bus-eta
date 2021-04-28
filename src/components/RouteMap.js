import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const RouteMap = ({geolocation, position}) => {
  const classes = useStyles()
  
  return (
    <Box className={classes.mapContainer}>
      <MapContainer center={checkPosition(position)} zoom={16} scrollWheelZoom={false} className={classes.mapContainer}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={checkPosition(position)} />
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

const useStyles = makeStyles ( theme => ({
  mapContainer: {
    height: '30vh',
    
  }
}) )