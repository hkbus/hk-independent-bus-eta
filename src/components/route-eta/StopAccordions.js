import React, { useEffect, useContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Accordion,
  AccordionSummary, 
  AccordionDetails,
  Box, 
  IconButton, 
  Typography
} from '@material-ui/core'
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../../AppContext'
import { useTranslation } from 'react-i18next'
import { getDistance, toProperCase } from '../../utils'
import TimeReport from './TimeReport'

const StopAccordions = ({expanded, setExpanded, handleChange}) => {
  const { id, panel } = useParams()
  const { 
    db: {routeList, stopList},
    savedEtas, geoPermission, geolocation,
    updateSavedEtas, energyMode
  } = useContext ( AppContext )

  const { stops, co, fares, faresHoliday } = routeList[id.toUpperCase()]
  const { t, i18n } = useTranslation()
  const accordionRef = useRef([])

  const autoSetPanel = () => {
    if ( parseInt(panel, 10) && accordionRef.current[parseInt(panel, 10)] ) {
      setExpanded(parseInt(panel, 10))
    } else if ( geoPermission === 'granted' ) {
      // load from local storage to avoid unitentional re-rendering
      const nearbyStop = getStops(co, stops)
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

  useStyles()

  const toggleSavedRoute = (key) => updateSavedEtas(key)

  return (
    <Box className={!energyMode ? "stopAccordions-boxContainer" : "stopAccordions-boxContainer-energy"}>
      {
        getStops(co, stops).map((stop, idx) => (
          <Accordion 
            key={'stop-'+idx} 
            expanded={expanded === idx}
            onChange={handleChange(idx)}
            TransitionProps={{unmountOnExit: true}}
            ref={el => {accordionRef.current[idx] = el}}
            classes={{root: "accordion-root", expanded: 'accordion-expanded'}}
          >
            <AccordionSummary classes={{root: "accordionSummary-root", content: "accordionSummary-content", expanded: "accordionSummary-expanded"}}>
              <Typography component="h3" variant="body1">{idx+1}. {toProperCase(stopList[stop].name[i18n.language])}</Typography>
              <Typography variant='caption'>
                {fares && fares[idx] ? t('車費')+': $'+fares[idx] : ''}
                {faresHoliday && faresHoliday[idx] ? '　　　　'+t('假日車費')+': $'+faresHoliday[idx] : ''}
              </Typography>
            </AccordionSummary>
            <AccordionDetails classes={{root: "accordionDetails-root"}}>
              <TimeReport 
                routeId={`${id.toUpperCase()}`}
                seq={idx}
              />
              <IconButton 
                aria-label="favourite" 
                onClick={() => toggleSavedRoute(`${id.toUpperCase()}/${idx}`)}
                style={{ backgroundColor: 'transparent' }} 
              >
                {savedEtas.includes(`${id.toUpperCase()}/${idx}`) ? <StarIcon/> : <StarBorderIcon />}
              </IconButton>
            </AccordionDetails>
          </Accordion>
        ))
      }
    </Box>
  )
}

// TODO: better handling on buggy data in database
const getStops = (co, stops) => {
  for ( let i = 0; i< co.length; ++i ) {
    if ( co[i] in stops ) {
      return stops[co[i]]
    }
  }
}

export default StopAccordions

const useStyles = makeStyles(theme => ({
  '@global': {
    '.accordion-root': {
      border: '1px solid rgba(0, 0, 0, .125)',
      boxShadow: 'none'
    },
    '.accordion-root:not(:last-child)': {
      borderBottom: 0,
    },
    '.accordion-root:before': {
      display: 'none',
    },
    '.accordion-root.accordion-expanded': {
      margin: 'auto',
    },
    '.accordionSummary-root': {
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.default : 'rgba(0, 0, 0, .03)',
      borderBottom: '1px solid rgba(0, 0, 0, .125)',
      marginBottom: -1,
      minHeight: 44
    },
    '.accordionSummary-root.accordionSummary-expanded': {
      minHeight: 44
    },
    '.accordionSummary-content': {
      margin: '8px 0',
      flexDirection: 'column'
    },
    '.accordionSummary-content.accordionSummary-expanded': {
      margin: '8px 0'
    },
    '.accordionDetails-root': {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      justifyContent: 'space-between'
    },
    ".stopAccordions-boxContainer": {
      overflowY: 'scroll',
      height: 'calc(100vh - 30vh - 47px)'
    },
    ".stopAccordions-boxContainer-energy": {
      overflowY: 'scroll',
      height: 'calc(100vh - 47px)'
    }
  }
}))