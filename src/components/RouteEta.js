import React, { useState, useEffect, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import RouteMap from './route-eta/RouteMap'
import StopAccordions from './route-eta/StopAccordions'
import StopDialog from './route-eta/StopDialog'
import { Typography } from '@material-ui/core'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'

const RouteEta = () => {
  const { id, panel } = useParams()
  const { AppTitle, routeList, stopList, stopMap, updateSelectedRoute } = useContext ( AppContext )
  const { route, stops, co, orig, dest, nlbId } = routeList[id]
  const [ expanded, setExpanded ] = useState(parseInt(panel, 10))
  const [ isDialogOpen, setIsDialogOpen ] = useState(false) 
  const [ dialogStop, setDialogStop ] = useState([[co[0], stops[co[0]][0]]].concat(stopMap[stops[co[0]][0]] || []))
  
  const { t, i18n } = useTranslation()
  const history = useHistory()

  const handleChange = ( panel ) => (event, newExpanded, isFromMap) => {
    setExpanded(newExpanded ? panel : false)
    setDialogStop ( [[co[0], stops[co[0]][panel]]].concat(stopMap[stops[co[0]][panel]] || []) )
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
    if ( i18n.language === 'zh' ) {
      return `由${co.map(c => t(c)).join('、')}聯營的${route}路線，途經${stops[co[0]].map(stop => stopList[stop].name.zh).join('、')}`
    } else {
      return `The route ${route} is supported by ${co.map(c => t(c)).join(',')}. The stops of the route are ${stops[co[0]].map(stop => stopList[stop].name.en).join(',')}`
    }
  }

  useEffect( () => {
    setIsDialogOpen(false)
    if ( panel ) {
      setExpanded(parseInt(panel,10))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route])

  useEffect(() => {
    document.title = route + ' ' + t('往') + ' ' + dest[i18n.language] + ' - ' + t(AppTitle)
    document.querySelector('meta[name="description"]').setAttribute("content", pageDesc())
    
    updateSelectedRoute( id )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Typography variant="subtitle1" align='center'>
        {route}
      </Typography>
      <Typography variant="caption" align='center'>
        {t('往')} {dest[i18n.language]} {nlbId ? t('由')+" "+orig[i18n.language] : ""}
      </Typography>
      <RouteMap 
        stops={stops[co[0]]}
        stopIdx={expanded}
        onMarkerClick={onMarkerClick}
      />
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

export default RouteEta