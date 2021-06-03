import React, { useContext, useEffect, useState } from 'react'
import {
  CircularProgress,
  Divider,
  ListItem,
  ListItemText
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../../AppContext'
import { useTranslation } from 'react-i18next'
import { 
  fetchEtas as fetchEtasViaApi
} from '../../data-api'
import { getDistance } from '../../utils'
import moment from 'moment'

const DistAndFare = ({name, location, fares, faresHoliday, seq}) => {
  const { t } = useTranslation ()
  const { geoPermission, geolocation } = useContext ( AppContext )
  const _fareString = fares && fares[seq] ? '$' + fares[seq] : '';
  const _fareHolidayString = faresHoliday && faresHoliday[seq] ? '$' + faresHoliday[seq] : '';
  const fareString = [_fareString, _fareHolidayString].filter(v => v).join(', ')
  console.log(fares)
  if ( geoPermission !== 'granted' ) {
    return name + '　' + ( fareString ? "("+fareString+")" : "" )
  }
  
  return name + ' - '+getDistance(location, geolocation).toFixed(0)+t('米')+
     '　' + ( fareString ? "("+fareString+")" : "" )
}

const SuccinctTimeReport = ({routeId} ) => {
  const { t, i18n } = useTranslation()
  const { routeList, stopList } = useContext ( AppContext )
  const [ routeNo, serviceType ] = routeId.split('+')
  const [ routeKey, seq ] = routeId.split('/')
  const { co, stops, dest, bound, nlbId, fares, faresHoliday } = routeList[routeKey]
  const stop = stopList[stops[co[0]] ? stops[co[0]][parseInt(seq, 10)] : null]
  const [ etas, setEtas ] = useState(null)
  const classes = useStyles()

  useEffect(() => {
    let isMounted = true
    
    const fetchData = () => (
      fetchEtasViaApi({
        route: routeNo, routeStops: stops, seq: parseInt(seq, 10), bound, serviceType, co, nlbId
      }).then ( _etas => {
        if (isMounted) setEtas(_etas)
      })
    )
    
    const fetchEtaInterval = setInterval(() => {
      fetchData()
    }, 30000)

    fetchData()

    return () => {
      isMounted = false
      clearInterval(fetchEtaInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getEtaString = (eta) => {
    if ( !eta ) return ''
    else {
      const waitTime = Math.round(moment(eta.eta).diff(moment()) / 60 / 1000)
      if ( waitTime < 1 ) {
        return '- '+t('分鐘')
      } else if ( Number.isInteger(waitTime) ) {
        return waitTime+" "+t('分鐘')
      } else {
        return eta.remark[i18n.language]
      }
    }
  }
  
  return (
    <>
    <ListItem
      button
      component={Link}
      to={`/${i18n.language}/route/${routeId}`}
      className={classes.listItem}
    >
      <ListItemText 
        primary={routeNo} 
        className={classes.route}
      />
      {
        stop ? <ListItemText 
          primary={t('往')+' '+dest[i18n.language]}
          secondary={
            <DistAndFare 
              name={stop.name[i18n.language]} 
              location={stop.location} 
              fares={fares} 
              faresHoliday={faresHoliday} 
              seq={parseInt(seq, 10)}
            />
          }
          className={classes.routeDest}
        /> : <CircularProgress size={15} />
      }
      <ListItemText
        primary={etas ? getEtaString(etas[0]) : ''}
        secondary={etas ? getEtaString(etas[1]) : ''}
        className={classes.routeEta}
      />
    </ListItem>
    <Divider />
    </>
  )
}

export default SuccinctTimeReport

const useStyles = makeStyles(theme => ({
  listItem: {
    padding: '4px 16px'
  },
  route: {
    width: '15%'
  },
  routeDest: {
    width: '65%'
  },
  routeEta: {
    width: '20%'
  }
}))