import React, { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import RouteMap from './route-eta/RouteMap'
import {
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary, 
  AccordionDetails as MuiAccordionDetails,
  Box, 
  CircularProgress,
  IconButton, 
  Typography
} from '@material-ui/core'
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { makeStyles, withStyles } from '@material-ui/core/styles'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import { 
  fetchRouteStops as fetchRouteStopsViaApi
} from '../data-api'
import { getDistance } from '../utils'
import TimeReport from './route-eta/TimeReport'

const RouteEta = () => {
  const { id, panel } = useParams()
  const [ expanded, setExpanded ] = useState(parseInt(panel))
  const { 
    routeList, stopList, savedEtas, geoPermission, geolocation,
    updateNewlyFetchedRouteStops, updateSelectedRoute, updateSavedEtas
  } = useContext ( AppContext )

  const { route, serviceType, bound, stops, co, dest } = routeList[id]
  const { t, i18n } = useTranslation()
  const history = useHistory()
  const accordionRef = useRef([])

  const handleChange = ( panel ) => (event, newExpanded, isFromMap) => {
    setExpanded(newExpanded ? panel : false)
    if ( newExpanded ) {
      history.replace(`/${i18n.language}/route/${id}/${panel}`)
      updateSelectedRoute( id, panel )
      if ( isFromMap ) {
        accordionRef.current[parseInt(panel)].scrollIntoView({behavior: 'smooth', block: 'start'})
      }
      return
    }
  }

  const autoSetPanel = () => {
    if ( parseInt(panel) && accordionRef.current[parseInt(panel)] ) {
      setExpanded(parseInt(panel))
      accordionRef.current[parseInt(panel)].scrollIntoView({behavior: 'smooth', block: 'start'})
    } else if ( geoPermission && stops[co[0]] ) {
      const nearbyStop = stops[co[0]]
        .map((stopId, idx) => [stopId, idx, getDistance(geolocation, stopList[stopId].location)])
        .sort((a,b) => a[2] - b[2])[0]
      if ( nearbyStop ) {
        const idx = nearbyStop[1]
        setExpanded(idx) 
        accordionRef.current[idx].scrollIntoView({behavior: 'smooth', block: 'start'})
      }
    }
  }

  useEffect(() => {
    autoSetPanel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeList])

  useEffect(() => {
    updateSelectedRoute( id )

    // fetch stops
    fetchRouteStopsViaApi({route, bound, stops}).then( objs => 
      updateNewlyFetchedRouteStops(id, objs)
    )

    autoSetPanel()
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

  const toggleSavedRoute = (key) => updateSavedEtas(key)

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
      <Box className={classes.boxContainer}>
        {
          stops[co[0]].map((stop, idx) => (
            <Accordion 
              key={'stop-'+idx} 
              expanded={expanded === idx}
              onChange={handleChange(idx)}
              TransitionProps={{unmountOnExit: true}}
              ref={el => {accordionRef.current[idx] = el}}
            >
              <AccordionSummary>{stopList[stop].name[i18n.language]}</AccordionSummary>
              <AccordionDetails>
                <TimeReport 
                  route={route}
                  seq={idx + 1}
                  routeStops={stops}
                  serviceType={serviceType}
                  bound={bound}
                  co={co}
                />
                <IconButton 
                  aria-label="favourite" 
                  onClick={() => toggleSavedRoute(`${id}/${panel}`)}
                  style={{ backgroundColor: 'transparent' }} 
                >
                  {savedEtas.includes(`${id}/${panel}`) ? <StarIcon/> : <StarBorderIcon />}
                </IconButton>
              </AccordionDetails>
            </Accordion>
          ))
        }
      </Box>
    </>
  )
}

export default RouteEta

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion)

const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    justifyContent: 'space-between'
  },
}))(MuiAccordionDetails);

const useStyles = makeStyles(theme => ({
  boxContainer: {
    overflowY: 'scroll'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center'
  }
}))