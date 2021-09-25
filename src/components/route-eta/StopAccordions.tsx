import React, { useState, useEffect, useContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Accordion,
  AccordionSummary, 
  AccordionDetails,
  Box, 
  IconButton, 
  Snackbar,
  Typography
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { styled } from '@mui/material/styles';
import AppContext from '../../AppContext'
import { useTranslation } from 'react-i18next'
import { getDistance, toProperCase, triggerShare } from '../../utils'
import TimeReport from './TimeReport'
import ShareIcon from '@mui/icons-material/Share';

interface RouteParams {
  id: string,
  panel: string
}

const StopAccordions = ({expanded, setExpanded, handleChange}) => {
  const { id, panel } = useParams<RouteParams>()
  
  const { 
    AppTitle,
    db: {routeList, stopList},
    savedEtas, geoPermission, geolocation,
    updateSavedEtas, energyMode
  } = useContext ( AppContext )
  const [ isCopied, setIsCopied ] = useState(false)
  const { route, dest, stops, co, fares, faresHoliday } = routeList[id.toUpperCase()]
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

  const toggleSavedRoute = (key) => updateSavedEtas(key)

  return (
    <StopAccordionsBox className={!energyMode ? classes.boxContainer : classes.boxContainerEnergy}>
      {
        getStops(co, stops).map((stop, idx) => (
          <StopAccordion 
            key={'stop-'+idx} 
            expanded={expanded === idx}
            onChange={handleChange(idx)}
            TransitionProps={{unmountOnExit: true}}
            ref={el => {accordionRef.current[idx] = el}}
            classes={{root: classes.accordionRoot, expanded: classes.accordionExpanded}}
          >
            <StopAccordionSummary classes={{root: classes.accordionSummaryRoot, content: classes.accordionSummaryContent, expanded: classes.accordionSummaryExpanded}}>
              <Typography component="h3" variant="body1">{idx+1}. {toProperCase(stopList[stop].name[i18n.language])}</Typography>
              <Typography variant='caption'>
                {fares && fares[idx] ? t('車費')+': $'+fares[idx] : ''}
                {faresHoliday && faresHoliday[idx] ? '　　　　'+t('假日車費')+': $'+faresHoliday[idx] : ''}
              </Typography>
            </StopAccordionSummary>
            <StopAccordionDetails classes={{root: classes.accordionDetailsRoot}}>
              <TimeReport 
                routeId={`${id.toUpperCase()}`}
                seq={idx}
              />
              <div style={{display: 'flex'}}>
                <IconButton
                  aria-label="share"
                  onClick={() => {
                    triggerShare(
                      `https://${window.location.hostname}/${i18n.language}/${id}`, 
                      `${idx+1}. ${toProperCase(stopList[stop].name[i18n.language])} - ${route} ${t('往')} ${toProperCase(dest[i18n.language])} - ${t(AppTitle)}` 
                    ).then(() => {
                      if (navigator.clipboard)
                        setIsCopied(true)
                    })
                  }}
                  style={{ backgroundColor: 'transparent' }}
                  size="large">
                  <ShareIcon />
                </IconButton>
                <IconButton
                  aria-label="favourite"
                  onClick={() => toggleSavedRoute(`${id.toUpperCase()}/${idx}`)}
                  style={{ backgroundColor: 'transparent' }}
                  size="large">
                  {savedEtas.includes(`${id.toUpperCase()}/${idx}`) ? <StarIcon/> : <StarBorderIcon />}
                </IconButton>
              </div>
            </StopAccordionDetails>
          </StopAccordion>
        ))
      }
      <Snackbar
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        open={isCopied}
        autoHideDuration={1500}
        onClose={(event, reason) => {
          setIsCopied(false);
        }}
        message={t('鏈結已複製到剪貼簿')}
      />
    </StopAccordionsBox>
  );
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

const PREFIX = 'stopAccordions'

const classes = {
  boxContainer: `${PREFIX}-boxContainer`,
  boxContainerEnergy: `${PREFIX}-boxContainerEnergy`,
  accordionRoot: `${PREFIX}-accordion-root`,
  accordionExpanded: `${PREFIX}-accordion-expanded`,
  accordionSummaryRoot: `${PREFIX}-summary-root`,
  accordionSummaryContent: `${PREFIX}-summary-content`,
  accordionSummaryExpanded: `${PREFIX}-summary-expanded`,
  accordionDetailsRoot: `${PREFIX}-details-root`
}

const StopAccordionsBox = styled(Box)(({theme}) => ({
  [`&.${classes.boxContainer}`]: {
    overflowY: 'scroll',
    height: 'calc(100vh - 30vh - 47px)'
  },
  [`&.${classes.boxContainerEnergy}`]: {
    overflowY: 'scroll',
    height: 'calc(100vh - 47px)'
  },
}))

const StopAccordion = styled(Accordion)(({theme}) => ({
  [`&.${classes.accordionRoot}`]: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '&:before': {
      display: 'none'
    },
    [`&.${classes.accordionExpanded}`]: {
      margin: 'auto'
    }
  }
}))

const StopAccordionSummary = styled(AccordionSummary)(({theme}) => ({
  [`&.${classes.accordionSummaryRoot}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 44,
    [`&.${classes.accordionSummaryExpanded}`]: {
      minHeight: 44
    },
    [`& .${classes.accordionSummaryContent}`]: {
      margin: '8px 0',
      flexDirection: 'column',
      [`&.${classes.accordionSummaryExpanded}`]: {
        margin: '8px 0'
      },
    }
  },
}))

const StopAccordionDetails = styled(AccordionDetails)(({theme}) => ({
  [`&.${classes.accordionDetailsRoot}`]: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    justifyContent: 'space-between',
    display: 'flex'
  },
}))