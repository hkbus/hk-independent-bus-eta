import React, { useState, useEffect, useContext } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import AppContext from '../../AppContext'
import SuccinctTimeReport from '../home/SuccinctTimeReport'


const StopDialog = ({open, stops, handleClose}) => {
  const { routeList, stopList } = useContext ( AppContext )
  const { i18n } = useTranslation()
  const [ routes, setRoutes ] = useState([])
  const classes = useStyles()

  useEffect(() => {
    if (stops === undefined) {
      setRoutes([])
      return
    }
    let _routes = [];
    Object.entries(routeList).forEach(([key, route]) => {
      stops.some( ([co, stopId]) => {
        if ( route.stops[co] && route.stops[co].includes(stopId) ) {
          _routes.push(key+'/'+route.stops[co].indexOf(stopId))
          return true
        }
        return false
      })
    })
    setRoutes(_routes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops])
  
  return (
    <Dialog open={open} onClose={handleClose} className={classes.dialog}>
      <DialogTitle className={classes.title}>{stopList[stops[0][1]].name[i18n.language]}</DialogTitle>
      <DialogContent>
        <List>
          {routes.map(route => (
            <SuccinctTimeReport key={route} routeId={route} />
          ))}
        </List>
      </DialogContent>
    </Dialog>
  )
}

const useStyles = makeStyles(theme => ({
  dialog: {
    '& .MuiPaper-root': {
      width: '100%',
      marginTop: '90px',
      height: 'calc(100vh - 100px)'
    }
  },
  title: {
    background: '#ffff90'
  }
}))

export default StopDialog