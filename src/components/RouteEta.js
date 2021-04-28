import React, { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import RouteMap from './RouteMap'
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
  fetchRouteStops as fetchRouteStopsViaApi,
  fetchEtas as fetchEtasViaApi 
} from '../data-api'

const RouteEta = () => {
  const { id, panel } = useParams()
  const [ expanded, setExpanded ] = useState(parseInt(panel))
  const { 
    routeList, stopList, savedEtas,
    updateNewlyFetchedRouteStops, updateSelectedRoute, updateSavedEtas
  } = useContext ( AppContext )

  const { route, serviceType, bound, stops, co, dest } = routeList[id]
  const { t, i18n } = useTranslation()
  const history = useHistory()
  const accordionRef = useRef([])

  const handleChange = ( panel ) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
    if ( newExpanded ) {
      history.replace(`/${i18n.language}/route/${id}/${panel}`)
      updateSelectedRoute( id, panel )
      return
    }
  }

  useEffect(() => {
    updateSelectedRoute( id )

    // fetch stops
    fetchRouteStopsViaApi({route, bound, stops}).then( objs => 
      updateNewlyFetchedRouteStops(id, objs)
    )

    if ( parseInt(panel) && accordionRef.current[parseInt(panel)] ) {
      setExpanded(parseInt(panel))
      accordionRef.current[parseInt(panel)].scrollIntoView({behavior: 'smooth', block: 'start'})
    }
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
        position={expanded && stops[co[0]] ? stopList[stops[co[0]][expanded]].location : null}
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
                <IconButton aria-label="favourite" onClick={() => toggleSavedRoute(`${id}/${panel}`)}>
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

const TimeReport = ( { route, routeStops, seq, bound, serviceType, co } ) => {
  const { t, i18n } = useTranslation()
  const [ etas, setEtas ] = useState(null)

  useEffect( () => {
    let isMounted = true
    const fetchData = () => {
      fetchEtasViaApi({route, routeStops, seq, bound, serviceType, co}).then(_etas => {
        if (isMounted) setEtas(_etas)
      })
    }
    fetchData()
    const fetchEtaInterval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => {
      isMounted = false
      clearInterval(fetchEtaInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if ( etas == null ) {
    return (
      <CircularProgress size={20} style={{}} />
    )
  }

  const displayMsg = (eta) => {
    let ret = ''
    switch (eta) {
      case null: 
        break
      case 0: 
        ret = '- '+t('分鐘')
        break
      default:
        ret = eta + " " + t('分鐘')
        break
    }
    return ret
  }
  
  return (
    <div>
      {
        etas.length === 0 ? t('暫無班次') : (
          etas.map((eta, idx) => (
            <Typography variant="subtitle1" key={`route-${idx}`}>
              {displayMsg(eta.eta)} - { eta.remark[i18n.language] ? eta.remark[i18n.language] : '' } {t(eta.co)}
            </Typography>
          ))
        )
      }
    </div>
  )
}

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