import React, { useState, useEffect, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import RouteMap from '../components/route-eta/RouteMap'
import StopAccordions from '../components/route-eta/StopAccordions'
import StopDialog from '../components/route-eta/StopDialog'
import { Typography } from '@material-ui/core'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import RouteNo from '../components/route-list/RouteNo'
import { setSeoHeader, toProperCase } from '../utils'

const RouteEta = () => {
  const { id, panel } = useParams()
  const { AppTitle, db:{ routeList, stopList, stopMap}, updateSelectedRoute, energyMode } = useContext ( AppContext )
  const { route, stops, co, orig, dest, nlbId, fares } = routeList[id.toUpperCase()]
  const [ expanded, setExpanded ] = useState(parseInt(panel, 10))
  const [ isDialogOpen, setIsDialogOpen ] = useState( false )
  const [ dialogStop, setDialogStop ] = useState(getDialogStops(co, stops, stopMap, 0))
  
  const { t, i18n } = useTranslation()
  const history = useHistory()

  const handleChange = ( panel ) => (event, newExpanded, isFromMap) => {
    setExpanded(newExpanded ? panel : false)
    setDialogStop ( getDialogStops(co, stops, stopMap, panel) )
    if ( newExpanded ) {
      history.replace(`/${i18n.language}/route/${id}/${panel}`)
      return
    }
  }

  const onMarkerClick = (panel) => {
    if ( expanded === panel ) {
      setIsDialogOpen(true)
    }
    return handleChange(panel)
  }
  
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

  return (
    <>
      <input hidden id={id} />
      <RouteNo routeNo={route} component="h1" align='center' />
      <Typography component="h2" variant="caption" align='center'>
        {t('往')} {toProperCase(dest[i18n.language])} {nlbId ? t('由')+" "+toProperCase(orig[i18n.language]) : ""}
      </Typography>
      {!energyMode ? <RouteMap 
        stops={getStops(co, stops)}
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
