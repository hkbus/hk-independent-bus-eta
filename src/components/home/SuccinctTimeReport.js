import React, { useContext } from 'react'
import {
  Divider,
  ListItem,
  ListItemText,
  Typography
} from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import { vibrate } from '../../utils'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../../AppContext'
import { useTranslation } from 'react-i18next'
import SuccinctEtas from './SuccinctEtas'
import { getDistance, toProperCase } from '../../utils'
import RouteNo from '../route-list/RouteNo'

const DistAndFare = ({name, location, fares, faresHoliday, seq}) => {
  const { t } = useTranslation ()
  const { geoPermission, geolocation } = useContext ( AppContext )
  const _fareString = fares && fares[seq] ? '$' + fares[seq] : '';
  const _fareHolidayString = faresHoliday && faresHoliday[seq] ? '$' + faresHoliday[seq] : '';
  const fareString = [_fareString, _fareHolidayString].filter(v => v).join(', ')
  
  if ( geoPermission !== 'granted' || location.lat === 0 ) {
    return name + '　' + ( fareString ? "("+fareString+")" : "" )
  }
  
  return name + ' - '+getDistance(location, geolocation).toFixed(0)+t('米')+
         '　' + ( fareString ? "("+fareString+")" : "" )
      
}

const SuccinctTimeReport = ({routeId} ) => {
  const { t, i18n } = useTranslation()
  const { db: {routeList, stopList} } = useContext ( AppContext )
  const [ routeNo ] = routeId.split('-')
  const [ routeKey, seq ] = routeId.split('/')
  const { co, stops, dest, fares, faresHoliday } = routeList[routeKey] || DefaultRoute
  const stop = stopList[getStops(co, stops)[parseInt(seq, 10)]] || DefaultStop
  
  useStyles()

  const history = useHistory()
  const handleClick = (e) => {
    e.preventDefault()
    vibrate(1)
    setTimeout(() => {
      history.push(`/${i18n.language}/route/${routeId.toLowerCase()}`)
    }, 0)
  }
  
  return (
    <>
    <ListItem
      component={Link}
      to={`/${i18n.language}/route/${routeKey.toLowerCase()}`}
      onClick={handleClick}
      className={"succinctTimeReport-listItem"}
    >
      <ListItemText 
        primary={<RouteNo routeNo={routeNo} />} 
        className={"succinctTimeReport-route"}
      />
      <ListItemText 
        primary={<Typography component="h3" variant="body1" color="textPrimary" className={"succinctTimeReport-fromToWrapper"}>
          <span className={"succinctTimeReport-fromToText"}>{t('往')}</span>
          <b>{toProperCase(dest[i18n.language])}</b>
        </Typography>}
        secondary={
          <DistAndFare 
            name={toProperCase(stop.name[i18n.language])} 
            location={stop.location} 
            fares={fares} 
            faresHoliday={faresHoliday} 
            seq={parseInt(seq, 10)}
          />
        }
        secondaryTypographyProps={{
          component: "h4", 
          variant: "subtitle2"
        }}
        className={"succinctTimeReport-routeDest"}
      />
      <SuccinctEtas routeId={routeId} />
    </ListItem>
    <Divider />
    </>
  )
}

const DefaultRoute = { co: [''], stops: {'': ['']}, dest: {zh: '', en: ''}, bound: '', nlbId: 0, fares: [], faresHoliday: [] }
const DefaultStop = {location: {lat: 0, lng: 0}, name: {zh: '', en: ''}}

export default SuccinctTimeReport

// TODO: better handling on buggy data in database
const getStops = (co, stops) => {
  for ( let i = 0; i< co.length; ++i ) {
    if ( co[i] in stops ) {
      return stops[co[i]]
    }
  }
}

const useStyles = makeStyles(theme => ({
  "@global":{
    ".succinctTimeReport-listItem": {
      padding: '4px 16px',
      color: 'rgba(0,0,0,0.87)'
    },
    ".succinctTimeReport-route": {
      width: '15%'
    },
    ".succinctTimeReport-routeDest": {
      width: '65%'
    },
    ".succinctTimeReport-fromToWrapper": {
      display: 'flex',
      alignItems: 'baseline',
    },
    ".succinctTimeReport-fromToText": {
      fontSize: '0.85rem',
      marginRight: theme.spacing(0.5)
    }
  }
}))