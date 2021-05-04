import React, { useContext, useEffect, useState } from 'react'
import {
  CircularProgress,
  List,
  Paper
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../AppContext'
import { 
  fetchRouteStops as fetchRouteStopsViaApi,
  fetchStopRoutes as fetchStopRoutesViaApi
} from '../data-api'
import { getDistance } from '../utils'
import SuccinctTimeReport from './home/SuccinctTimeReport'

const Home = () => {
  const { 
    hotRoute, savedEtas, geolocation, routeList, stopList,
    setStopList, setRouteList
  } = useContext ( AppContext )

  const [selectedRoutes, setSelectedRoute] = useState(
    savedEtas.concat(
      Object.entries(hotRoute).filter(([route, count]) => count > 5)
      .sort((a,b) => b[1] - a[1])
      .map(([routeId]) => routeId)
    ).filter((routeId, index, self) => self.indexOf(routeId) === index)
    .slice(0,20)
  )
  const [doneGeoRoutes, setDoneGeoRoutes] = useState(false)

  useEffect (() => {
    let isMounted = true
    
    Object.entries(stopList).map(stop => 
      // potentially could be optimized by other distance function
      stop.concat(getDistance(stop[1].location, geolocation))
    ).filter(stop => 
      // keep only nearby 200m stops
      stop[2] < 200
    ).sort((a, b) => 
      a[2] - b[2]
    ).slice(0, 5).forEach(([stopId]) => {
      // keep only max. 5 stops
      // fetch route stops if not in database
      fetchStopRoutesViaApi(stopId, routeList).then(routeIds => {
        Promise.all(
          routeIds.map( routeId => (
            fetchRouteStopsViaApi(routeList[routeId]).then(stopDetails => [routeId, stopDetails])
          ))
        ).then( arr => {
          let _routeList = JSON.parse(JSON.stringify(routeList))
          let _stopList = JSON.parse(JSON.stringify(stopList))
          let isUpdated = false
          arr.forEach(([routeId, stopDetails]) => {
            stopDetails.forEach( routeStopInfo => {
              _routeList[routeId].stops[routeStopInfo.co] = routeStopInfo.routeStops
              _stopList = {..._stopList, ...routeStopInfo.stopList}
            })
            isUpdated = true
          })
          if ( isUpdated ) {
            setStopList(_stopList)
            setRouteList(_routeList)
          }
          
          // add nearby routes to display
          if ( isMounted ) {
            setSelectedRoute(prevSelectedRoutes => 
              prevSelectedRoutes.concat(
                routeIds.map(routeId => {
                  setDoneGeoRoutes(true)
                  return routeId + '/' + Object.entries(_routeList[routeId].stops).map(
                    ([co, stops]) => stops.indexOf(stopId)
                  ).filter(v => v >= 0)[0] 
                })
              ).filter( (v, i, s) => s.indexOf(v) === i ).slice(0,20)
            )
          }
        })
      })
    })
    
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation])

  const classes = useStyles()
  return (
    <Paper className={classes.root}>
      <List className={classes.list}>
      {
        selectedRoutes.map( selectedRoute => (
          <SuccinctTimeReport key={selectedRoute} routeId={selectedRoute} />
         ) )
      }
      </List>
      {
        !doneGeoRoutes ? <CircularProgress size={20} /> : <></>
      }
    </Paper>
  )
}

export default Home

const useStyles = makeStyles ( theme => ({
  root: {
    background: 'white',
    height: 'calc(100vh - 120px)',
    overflowY: 'scroll',
    textAlign: 'center'
  }
}))

