import React, { useContext, useEffect, useState, useMemo } from 'react'
import {
  List,
  Paper,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../AppContext'
import { getDistance, setSeoHeader } from '../utils'
import SuccinctTimeReport from './home/SuccinctTimeReport'
import { useTranslation } from 'react-i18next'

const Home = () => {
  const { 
    AppTitle, geolocation,
    hotRoute, savedEtas, db: {routeList, stopList}
  } = useContext ( AppContext )
  const { t, i18n } = useTranslation()

  // selectedRoutes is a '|' joined string instead of array for useMemo comparison
  const [selectedRoutes, setSelectedRoute] = useState(getSelectedRoutes({
    geolocation, hotRoute, savedEtas, routeList, stopList
  }))
  
  useEffect (() => {
    setSeoHeader ({
      title: `${t('Dashboard')} - ${t(AppTitle)}`,
      description: t('home-page-description'),
      lang: i18n.language
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
    
  useEffect( () => {
    const _selectedRoutes = getSelectedRoutes({
      geolocation, hotRoute, savedEtas, routeList, stopList
    })
    if ( _selectedRoutes !== selectedRoutes ) {
      setSelectedRoute(_selectedRoutes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation])

  useStyles()

  return useMemo(() => (
    <Paper className={"home-root"} square elevation={0}>
      <Typography component="h1" variant="srOnly">{`${t('Dashboard')} - ${t(AppTitle)}`}</Typography>
      <Typography component="h2" variant="srOnly">{t('home-page-description')}</Typography>
      <List disablePadding>
      {
        selectedRoutes.split('|').map( (selectedRoute, idx) => (
          <SuccinctTimeReport key={`route-shortcut-${idx}`} routeId={selectedRoute} />
        ))
      }
      </List>
    </Paper>
    // eslint-disable-next-line
  ), [selectedRoutes])
}

export default Home

const getSelectedRoutes = ({hotRoute, savedEtas, geolocation, stopList, routeList}) => {
  const selectedRoutes = savedEtas.concat(
    Object.entries(hotRoute).filter(([route, count]) => count > 5)
    .sort((a,b) => b[1] - a[1])
    .map(([routeId]) => routeId)
  ).filter((routeId, index, self) => self.indexOf(routeId) === index)
  .slice(0,20)
  
  const nearbyRoutes = Object.entries(stopList).map(stop =>
    // potentially could be optimized by other distance function
    stop.concat(getDistance(stop[1].location, geolocation))
  ).filter(stop => 
    // keep only nearby 1000m stops
    stop[2] < 1000
  ).sort((a, b) => 
    a[2] - b[2]
  ).slice(0, 5).reduce((acc, [stopId]) => {
    // keep only the nearest 5 stops
    let routeIds = []
    Object.entries(routeList).forEach(([key, route]) => {  
      ['kmb', 'nwfb', 'ctb', 'nlb'].forEach(co => {
        if (route.stops[co] && route.stops[co].includes(stopId)) {
          routeIds.push(key+'/'+route.stops[co].indexOf(stopId))
        }
      })
    })
    return acc.concat(routeIds)
  }, [])
  return selectedRoutes
    .concat(nearbyRoutes)
    .filter( (v, i, s) => s.indexOf(v) === i ) // uniqify
    .concat(Array(20).fill('')) // padding
    .slice(0,20).join('|')
}

const useStyles = makeStyles ( theme => ({
  "@global": {
    ".home-root": {
      background: theme.palette.type === 'dark' ? theme.palette.background.default : 'white',
      height: 'calc(100vh - 125px)',
      overflowY: 'scroll',
      textAlign: 'center'
    }
  }
}))

