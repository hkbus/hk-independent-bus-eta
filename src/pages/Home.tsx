import React, { useContext, useEffect, useRef, useState, useMemo } from 'react'
import {
  List,
  Paper,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import AppContext from '../AppContext'
import { getDistance, setSeoHeader } from '../utils'
import SuccinctTimeReport from '../components/home/SuccinctTimeReport'
import { useTranslation } from 'react-i18next'
import throttle from 'lodash.throttle'
import { Location, RouteList, StopListEntry, StopList } from 'hk-bus-eta'
import { isHoliday, isRouteAvaliable } from '../timetable'

const Home = () => {
  const { 
    AppTitle, geolocation,
    hotRoute, savedEtas, db: {holidays, routeList, stopList}, isRouteFilter
  } = useContext ( AppContext )
  const { t, i18n } = useTranslation()
  const isTodayHoliday = isHoliday(holidays, new Date())
  
  // selectedRoutes is a '|' joined string instead of array for useMemo comparison
  const [selectedRoutes, setSelectedRoute] = useState(getSelectedRoutes({
    geolocation, hotRoute, savedEtas, routeList, stopList, isRouteFilter, isTodayHoliday
  }))

  
  
  const throttledUpdateRoutes = useRef(throttle(newGeolocation => {
    const _selectedRoutes = getSelectedRoutes({
      geolocation: newGeolocation, hotRoute, savedEtas, routeList, stopList, isRouteFilter, isTodayHoliday
    })
    if ( _selectedRoutes !== selectedRoutes ) {
      setSelectedRoute(_selectedRoutes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 60000)).current
  
  useEffect (() => {
    setSeoHeader ({
      title: `${t('Dashboard')} - ${t(AppTitle)}`,
      description: t('home-page-description'),
      lang: i18n.language
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])
    
  useEffect( () => {
    throttledUpdateRoutes(geolocation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation])

  return useMemo(() => (
    <Root className={classes.root} square elevation={0}>
      <Typography component="h1" style={visuallyHidden}>{`${t('Dashboard')} - ${t(AppTitle)}`}</Typography>
      <Typography component="h2" style={visuallyHidden}>{t('home-page-description')}</Typography>
      <List disablePadding>
      {
        selectedRoutes.split('|').map( (selectedRoute, idx) => (
          <SuccinctTimeReport key={`route-shortcut-${idx}`} routeId={selectedRoute} />
        ))
      }
      </List>
    </Root>
    // eslint-disable-next-line
  ), [selectedRoutes])
}

export default Home

const getSelectedRoutes = ({hotRoute, savedEtas, geolocation, stopList, routeList, isRouteFilter, isTodayHoliday}: 
        {hotRoute: Record<string, number>, savedEtas: string[], geolocation: Location, stopList: StopList, routeList: RouteList, isRouteFilter: boolean, isTodayHoliday: boolean }): string => {
  const selectedRoutes = savedEtas.concat(
    Object.entries(hotRoute).filter(([route, count]) => count > 5)
    .sort((a, b) => b[1] - a[1])
    .map(([routeId]) => routeId)
  ).filter((routeId, index, self) => self.indexOf(routeId) === index)
  .map( (routeUrl):[string, number] => {
    const [routeId, stopIdx] = routeUrl.split('/') 
    // TODO: taking the longest stop array to avoid error, should be fixed in the database
    const stop = stopList[Object.values(routeList[routeId].stops).sort((a, b) => b.length - a.length)[0][stopIdx]] 
    return [routeUrl, getDistance(geolocation, stop.location)]
  })
  .sort((a, b)  => a[1] - b[1])
  .map(v => v[0])
  .slice(0,20)
  
  const nearbyRoutes = Object.entries(stopList).map((stop:[string, StopListEntry]): [string, StopListEntry, number] =>
    // potentially could be optimized by other distance function
    [...stop, getDistance(stop[1].location, geolocation)]
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
    .filter( ( routeUrl ) => {
      const [routeId, ] = routeUrl.split('/')
      return !isRouteFilter || isRouteAvaliable(routeList[routeId].freq, isTodayHoliday)
    } )
    .concat(Array(20).fill('')) // padding
    .slice(0,20).join('|')
}

const PREFIX = 'home'

const classes = {
  root: `${PREFIX}-root`
}

const Root = styled(Paper)(({theme}) => ({
  [`&.${classes.root}`]: {
    background: theme.palette.mode === 'dark' ? theme.palette.background.default : 'white',
    height: 'calc(100vh - 125px)',
    overflowY: 'scroll',
    textAlign: 'center'
  }
}))
