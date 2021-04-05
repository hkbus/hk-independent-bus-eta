import React, { useState, useEffect, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import RouteMap from './route-eta/RouteMap'
import StopAccordions from './route-eta/StopAccordions'
import {
  Box, 
  CircularProgress,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import { 
  fetchRouteStops as fetchRouteStopsViaApi
} from '../data-api'

const RouteEta = () => {
  const { id, panel } = useParams()
  const [ expanded, setExpanded ] = useState(parseInt(panel, 10))
  const { 
    routeList, stopList, 
    updateNewlyFetchedRouteStops, updateSelectedRoute
  } = useContext ( AppContext )

  const { route, bound, stops, co, dest } = routeList[id]
  const { t, i18n } = useTranslation()
  const history = useHistory()

  const handleChange = ( panel ) => (event, newExpanded, isFromMap) => {
    setExpanded(newExpanded ? panel : false)
    if ( newExpanded ) {
      history.replace(`/${i18n.language}/route/${id}/${panel}`)
      return
    }
  }

  useEffect(() => {
    updateSelectedRoute( id )

    // fetch stops
    fetchRouteStopsViaApi({route, bound, stops}).then( objs => 
      updateNewlyFetchedRouteStops(id, objs)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const classes = useStyles()

  if ( stops[co[0]] == null ) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress size={30} />
      </Box>
    )
  }

  // as stops for some routes are not fetched beforehand
  // the route may be not exist as it is uni-direction
  if ( stops[co[0]].length === 0 ) {
    return (
      <>
        <Typography variant="h5" align="center">{t('路線不存在')}</Typography>
      </>
    )
  }

  return (
    <>
      <Typography variant="subtitle1" align='center'>
        {route}
      </Typography>
      <Typography variant="caption" align='center'>
        {t('往')} {dest[i18n.language]}
      </Typography>
      <RouteMap 
        stops={stops[co[0]]}
        stopList={stopList}
        stopIdx={expanded}
        onMarkerClick={handleChange}
      />
      <StopAccordions 
        expanded={expanded}
        setExpanded={setExpanded}
        handleChange={handleChange}
      />
    </>
  )
}

export default RouteEta

const useStyles = makeStyles(theme => ({
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center'
  }
}))