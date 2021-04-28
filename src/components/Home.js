import React, { useContext, useEffect, useState } from 'react'
import {
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import { 
  fetchEtas as fetchEtasViaApi, 
  fetchRouteStops as fetchRouteStopsViaApi,
  fetchStopEtas as fetchStopEtasViaApi
} from '../data-api'

const SuccintTimeReport = ({routeId} ) => {
  const { t, i18n } = useTranslation()
  const { routeList, stopList, updateNewlyFetchedRouteStops } = useContext ( AppContext )
  const [ routeNo, serviceType ] = routeId.split('+')
  const [ routeKey, seq ] = routeId.split('/')
  const { co, stops, dest, bound } = routeList[routeKey]
  const stop = stopList[stops[co[0]] ? stops[co[0]][seq] : null]
  const [ etas, setEtas ] = useState(null)
  const classes = useStyles()

  useEffect(() => {
    let isMounted = true
    const fetchData = () => (
      fetchEtasViaApi({
        route: routeNo, routeStops: stops, seq: parseInt(seq) + 1, bound, serviceType, co
      }).then ( _etas => {
        if (isMounted) setEtas(_etas)
      })
    )
    // fetch stops
    fetchRouteStopsViaApi({route: routeNo, bound, stops}).then( objs => {
      updateNewlyFetchedRouteStops(routeKey, objs)
      fetchData()
    })
    const fetchEtaInterval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => {
      isMounted = false
      clearInterval(fetchEtaInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getEtaString = (eta) => {
    if ( !eta ) return ''
    let ret = ''
    switch (eta.eta) {
      case null: 
        ret = eta.remark[i18n.language]
        break
      case 0: 
        ret = '- '+t('分鐘')
        break
      default:
        ret = eta.eta + " " + t('分鐘')
        break
    }
    return ret
  }

  return (
    <>
    <ListItem
      button
      component={Link}
      to={`/${i18n.language}/route/${routeId}`}
    >
      <ListItemText 
        primary={routeNo} 
        className={classes.route}
      />
      <ListItemText 
        primary={t('往')+' '+dest[i18n.language]}
        secondary={stop ? stop.name[i18n.language] : <CircularProgress size={15} />} 
        className={classes.routeDest}
      />
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

const Home = () => {
  const { hotRoute, savedEtas, geoPermission, geolocation, routeList, stopList } = useContext ( AppContext )

  const [selectedRoutes, setSelectedRoute] = useState(
    savedEtas.concat(
      Object.entries(hotRoute).filter(([route, count]) => count > 5)
      .sort((a,b) => b[1] - a[1])
      .map(([routeId]) => routeId)
    ).filter((routeId, index, self) => self.indexOf(routeId) === index)
    .slice(0,20)
  )

  useEffect (() => {
    if ( geoPermission === 'granted') {
      Object.entries(stopList).map(stop => 
        // potentially could be optimized by other distance function
        stop.concat(getDistance(stop[1].location, geolocation))
      ).filter(stop => 
        // keep only nearby 200m stops
        stop[2] < 200
      ).sort((a, b) => 
        a[2] - b[2]
      ).slice(0, 3).map(([stopId]) => 
        fetchStopEtasViaApi(stopId, routeList).then(routeIds => {
          setSelectedRoute(prevSelectedRoutes =>   
            prevSelectedRoutes.concat(routeIds).filter( (v, i, s) => s.indexOf(v) === i )
          )
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation])

  const classes = useStyles()
  return (
    <Paper className={classes.root}>
      <List>
      {
        selectedRoutes.map( selectedRoute => <SuccintTimeReport key={selectedRoute} routeId={selectedRoute} /> )
      }
      </List>
    </Paper>
  )
}

export default Home

const getDistance = (a, b) => {
  const R = 6371e3; // metres
  const φ1 = a.lat * Math.PI/180; // φ, λ in radians
  const φ2 = b.lat * Math.PI/180;
  const Δφ = (b.lat-a.lat) * Math.PI/180;
  const Δλ = (b.lng-a.lng) * Math.PI/180;

  const aa = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
  return R * c; // in metres
}

const useStyles = makeStyles ( theme => ({
  root: {
    background: 'white',
    height: 'calc(100vh - 120px)',
    overflowY: 'scroll'
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

