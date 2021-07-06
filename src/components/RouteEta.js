import React, { useState, useEffect, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import RouteMap from './route-eta/RouteMap'
import StopAccordions from './route-eta/StopAccordions'
import StopDialog from './route-eta/StopDialog'
import { Typography } from '@material-ui/core'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import RouteNo from './route-board/RouteNo'

const RouteEta = () => {
  const { _id, panel } = useParams()
  const id = _id.replace(/_/g, ' ')
  const { AppTitle, routeList, stopList, stopMap, updateSelectedRoute } = useContext ( AppContext )
  const { route, stops, co, orig, dest, nlbId } = routeList[id]
  const [ expanded, setExpanded ] = useState(parseInt(panel, 10))
  const [ isDialogOpen, setIsDialogOpen ] = useState(false)
  const [ dialogStop, setDialogStop ] = useState(getDialogStops(co, stops, stopMap, 0))
  
  const { t, i18n } = useTranslation()
  const history = useHistory()

  const handleChange = ( panel ) => (event, newExpanded, isFromMap) => {
    setExpanded(newExpanded ? panel : false)
    setDialogStop ( getDialogStops(co, stops, stopMap, panel) )
    if ( newExpanded ) {
      history.replace(`/${i18n.language}/route/${_id}/${panel}`)
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
    if ( i18n.language === 'zh' ) {
      return `由${co.map(c => t(c)).join('、')}聯營的${route}路線，途經${getStops(co,stops).map(stop => stopList[stop].name.zh).join('、')}`
    } else {
      return `The route ${route} is supported by ${co.map(c => t(c)).join(',')}. The stops of the route are ${getStops(co,stops).map(stop => stopList[stop].name.en).join(',')}`
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
    document.title = route + ' ' + t('往') + ' ' + dest[i18n.language] + ' - ' + t(AppTitle)
    document.querySelector('meta[name="description"]').setAttribute("content", pageDesc())
    document.querySelector('link[rel="canonical"]').setAttribute("href", `https://hkbus.app/${i18n.language}/route/${_id}`)
    document.querySelector('link[rel="alternative"][hreflang="en"]').setAttribute("href", `https://hkbus.app/en/route/${_id}`)
    document.querySelector('link[rel="alternative"][hreflang="zh-Hant"]').setAttribute("href", `https://hkbus.app/zh/route/${_id}`)
    document.getElementById(_id).setAttribute("value", _id)
  }

  useEffect(() => {
    updateHeader()
    updateSelectedRoute( id )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    updateHeader()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id])

  return (
    <>
      <input hidden id={_id} />
      <Typography variant="subtitle1" align='center'>
        <RouteNo routeNo={route} />
      </Typography>
      <Typography variant="caption" align='center'>
        {t('往')} {dest[i18n.language]} {nlbId ? t('由')+" "+orig[i18n.language] : ""}
      </Typography>
      {navigator.userAgent !== 'prerendering' ? <RouteMap 
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