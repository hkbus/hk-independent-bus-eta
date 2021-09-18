import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import RouteMap from '../components/route-eta/RouteMap'
import StopAccordions from '../components/route-eta/StopAccordions'
import StopDialog from '../components/route-eta/StopDialog'
import { Button, Divider, Paper, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import RouteNo from '../components/route-list/RouteNo'
import { setSeoHeader, toProperCase } from '../utils'
import ScheduleIcon from '@material-ui/icons/Schedule'
import TimetableDrawer from '../components/route-eta/TimetableDrawer'
import Leaflet from 'leaflet'

const RouteEta = () => {
  const { id, panel } = useParams()
  const { AppTitle, db:{ routeList, stopList, stopMap}, updateSelectedRoute, energyMode, workbox } = useContext ( AppContext )
  const { route, stops, co, orig, dest, nlbId, fares, freq } = routeList[id.toUpperCase()]
  const [ expanded, setExpanded ] = useState(parseInt(panel, 10))
  const [ isDialogOpen, setIsDialogOpen ] = useState( false )
  const [ isOpenTimetable, setIsOpenTimetable] = useState(false)
  const [ dialogStop, setDialogStop ] = useState(getDialogStops(co, stops, stopMap, 0))
  
  const { t, i18n } = useTranslation()
  const history = useHistory()
  useStyles()

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
    setDialogStop ( getDialogStops(co, stops, stopMap, panel) )
    if ( newExpanded ) {
      history.replace(`/${i18n.language}/route/${id}/${panel}`)
      return
    }
  }

  const onMarkerClick = useCallback((panel, event) => {
    if (expanded === panel) {
      setIsDialogOpen(true)
    }
    setExpanded(panel);
    setDialogStop(getDialogStops(co, stops, stopMap, panel));
    history.replace(`/${i18n.language}/route/${id}/${panel}`);
  }, [co, expanded, history, i18n.language, id, stopMap, stops])
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const pageDesc = () => {
    const uniqueFares = fares ? fares.filter((v, idx, self) => self.indexOf(v) === idx).map(v => `$${v}`) : []
    if ( i18n.language === 'zh' ) {
      return (`路線${route}`+
        `由${orig.zh}出發，以${dest.zh}為終點，` +
        (uniqueFares.length ? `分段車費為${uniqueFares.join('、')}，`:'') +
        `途經${getStops(co,stops).map(stop => stopList[stop].name.zh).join('、')}。`
      )
    } else {
      return (`Route ${route} `+
        `is from ${toProperCase(orig.en)} to ${toProperCase(dest.en)}` +
        (uniqueFares.length ? `, section fees are ${uniqueFares.join(', ')}. ` : '. ') +
        'Stops: '+ toProperCase(getStops(co,stops).map(stop => stopList[stop].name.en).join(', ')) +'. ')
    }
  }

  useEffect( () => {
    setIsDialogOpen(false)
    if ( panel ) {
      setExpanded(parseInt(panel,10))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route])

  const updateHeader = () => {
    setSeoHeader({
      title: route + ' ' + t('往') + ' ' + toProperCase(dest[i18n.language]) + ' - ' + t(AppTitle),
      description: pageDesc(),
      lang: i18n.language
    })
    // the following is notify the rendering is done, for pre-rendering purpose
    document.getElementById(id).setAttribute("value", id)
  }

  useEffect(() => {
    updateHeader()
    updateSelectedRoute( id )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, i18n.language])

  const stopsExtracted = useMemo(() => {
    return getStops(co, stops).map(id => {
      return stopList[id];
    }).filter(stop => stop !== null && stop !== undefined);
  }, [co, stopList, stops]);

  useEffect(() => {
    if (!energyMode) {
      /**
       * @type {WarnUpMessageData}
       **/
      const message = {
        type: "WARN_UP_MAP_CACHE",
        retinaDisplay: Leaflet.Browser.retina,
        zoomLevels: [14, 15, 16, 17, 18],
        stopList: getStops(co, stops).map(id => {
          return stopList[id];
        }).filter(stop => stop !== null && stop !== undefined)
      };
      workbox?.messageSW(message);
    }
  }, [co, energyMode, stopList, stops, workbox]);

  return (
    <>
      <input hidden id={id} />
      <Paper className="route-header" elevation={0}>
        <RouteNo routeNo={route} component="h1" align='center' />
        <Typography component="h2" variant="caption" align='center'>
          {t('往')} {toProperCase(dest[i18n.language])} {nlbId ? t('由')+" "+toProperCase(orig[i18n.language]) : ""}
        </Typography>
        {freq ? <>
          <Divider orientation="vertical" className={'timetable-button-divider'} />
          <Button 
            variant="text"
            aria-label="open-timetable"
            className="timetable-button" 
            size="small"
            startIcon={<ScheduleIcon />}
            onClick={() => setIsOpenTimetable(true)}
          >
            {t('時間表')}
          </Button>
          <TimetableDrawer freq={freq} open={isOpenTimetable} onClose={() => setIsOpenTimetable(false)} /> 
        </>: <></>}
      </Paper>
      {!energyMode ? <RouteMap 
        stops={stopsExtracted}
        stopIdx={expanded}
        onMarkerClick={onMarkerClick}
      /> : <></>}
      <StopAccordions 
        expanded={expanded}
        setExpanded={setExpanded}
        handleChange={handleChange}
      />
      <StopDialog
        open={isDialogOpen}
        stops={dialogStop}
        handleClose={handleCloseDialog}
      />
    </>
  )
}

// TODO: better handling on buggy data in database
/**
 * 
 * @param {string[]} co 
 * @param {Record<string, string[]>} stops
 * @returns {string[]}
 */
const getStops = (co, stops) => {
  for ( let i = 0; i< co.length; ++i ) {
    if ( co[i] in stops ) {
      return stops[co[i]]
    }
  }
}

// TODO: better handling on buggy data in database
const getDialogStops = (co, stops, stopMap, panel) => {
  for ( let i = 0; i < co.length; ++i ){
    if ( co[i] in stops )
      return [[co[i], stops[co[i]][panel]]].concat(stopMap[stops[co[i]][panel]] || [])
  }
}

export default RouteEta

const useStyles = makeStyles(theme => ({
  '@global': {
    '.route-header': {
      textAlign: 'center',
      background: 'transparent',
      position: 'relative'
    },
    '.timetable-button-divider': {
      position: 'absolute',
      top: '0',
      right: 'calc(64px + 2%)'
    },
    '.timetable-button': {
      position: 'absolute',
      top: '0',
      right: '2%'
    },
    '.timetable-button > .MuiButton-label': {
      flexDirection: 'column',
      justifyContent: 'center'
    },
    '.timetable-button > .MuiButton-label > .MuiButton-startIcon': {
      margin: 0
    }
  }
}))
