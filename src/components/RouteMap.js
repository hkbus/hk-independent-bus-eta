import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const RouteMap = ({geolocation, position}) => {
  const classes = useStyles()
  
  return (
    <Box className={classes.mapContainer}>
      <MapContainer center={position} zoom={17} scrollWheelZoom={false} className={classes.mapContainer}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
      </MapContainer>
    </Box>
  )
}

export default RouteMap

const useStyles = makeStyles ( theme => ({
  mapContainer: {
    height: '30vh',
    
  }

}) )