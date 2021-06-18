import React, { useState, useEffect, useContext } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import RouteMap from './route-eta/RouteMap'
import StopAccordions from './route-eta/StopAccordions'
import StopDialog from './route-eta/StopDialog'
import {
  Box, 
  CircularProgress,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'

const RouteEta = () => {
  const { id, panel } = useParams()
  const [ expanded, setExpanded ] = useState(parseInt(panel, 10))
  const [ dialogStop, setDialogStop ] = useState(undefined)
  const { routeList, stopMap, updateSelectedRoute } = useContext ( AppContext )

  const { route, stops, co, orig, dest, nlbId } = routeList[id]
  const { t, i18n } = useTranslation()
  const history = useHistory()

  const handleChange = ( panel ) => (event, newExpanded, isFromMap) => {
    setExpanded(newExpanded ? panel : false)
    if ( newExpanded ) {
      history.replace(`/${i18n.language}/route/${id}/${panel}`)
      return
    }
  }

  const onMarkerClick = (panel) => {
    if ( expanded === panel ) {
      setDialogStop ( [[co[0], stops[co[0]][panel]]].concat(stopMap[stops[co[0]][panel]] || []) )
    }
    return handleChange(panel)
  }
  
  const handleCloseDialog = () => {
    setDialogStop(undefined)
  }

  useEffect( () => {
    setDialogStop(undefined)
    if ( panel ) {
      setExpanded(parseInt(panel,10))
    }
  }, [route])

  useEffect(() => {
    updateSelectedRoute( id )
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
        stops={dialogStop}
        handleClose={handleCloseDialog}
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