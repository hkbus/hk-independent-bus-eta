import React, { useEffect, useContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary, 
  AccordionDetails as MuiAccordionDetails,
  Box, 
  IconButton, 
  Typography
} from '@material-ui/core'
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import AppContext from '../../AppContext'
import { useTranslation } from 'react-i18next'
import { getDistance } from '../../utils'
import TimeReport from './TimeReport'

const StopAccordions = ({expanded, setExpanded, handleChange}) => {
  const { id, panel } = useParams()
  const { 
    routeList, stopList, savedEtas, geoPermission,
    updateSavedEtas
  } = useContext ( AppContext )

  const { route, serviceType, bound, stops, co, fares, faresHoliday, nlbId } = routeList[id]
  const { t, i18n } = useTranslation()
  const accordionRef = useRef([])

  const autoSetPanel = () => {
    if ( parseInt(panel, 10) && accordionRef.current[parseInt(panel, 10)] ) {
      setExpanded(parseInt(panel, 10))
    } else if ( geoPermission && stops[co[0]] ) {
      // load from local storage to avoid unitentional re-rendering
      const geolocation = JSON.parse(localStorage.getItem('geolocation'))
      const nearbyStop = stops[co[0]]
        .map((stopId, idx) => [stopId, idx, getDistance(geolocation, stopList[stopId].location)])
        .sort((a,b) => a[2] - b[2])[0]
      if ( nearbyStop ) {
        const idx = nearbyStop[1]
        setExpanded(idx)
      }
    }
  }

  useEffect(() => {
    // scroll to specific bus stop
    // check acordion ref not null to ensure it is not in rendering
    if ( expanded !== false && accordionRef.current[expanded]) {
      accordionRef.current[expanded].scrollIntoView({behavior: 'smooth', block: 'center'})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded])

  useEffect(() => {
    autoSetPanel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const classes = useStyles()

  const toggleSavedRoute = (key) => updateSavedEtas(key)

  return (
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
            <AccordionSummary>
              <Typography variant='body1'>{stopList[stop].name[i18n.language]}</Typography>
              <Typography variant='caption'>
                {fares && fares[idx] ? t('車費')+': $'+fares[idx] : ''}
                {faresHoliday && faresHoliday[idx] ? '　　　　'+t('假日車費')+': $'+faresHoliday[idx] : ''}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TimeReport 
                route={route}
                seq={idx}
                routeStops={stops}
                serviceType={serviceType}
                bound={bound}
                co={co}
                nlbId={nlbId}
              />
              <IconButton 
                aria-label="favourite" 
                onClick={() => toggleSavedRoute(`${id}/${idx}`)}
                style={{ backgroundColor: 'transparent' }} 
              >
                {savedEtas.includes(`${id}/${idx}`) ? <StarIcon/> : <StarBorderIcon />}
              </IconButton>
            </AccordionDetails>
          </Accordion>
        ))
      }
    </Box>
  )
}

export default StopAccordions

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
    }
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
    flexDirection: 'column'
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