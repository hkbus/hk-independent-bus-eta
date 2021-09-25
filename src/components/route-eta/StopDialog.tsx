import React, { useState, useEffect, useContext } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List
} from '@mui/material'
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next'
import AppContext from '../../AppContext'
import SuccinctTimeReport from '../home/SuccinctTimeReport'


const StopDialog = ({open, stops, handleClose}) => {
  const { db:{routeList, stopList} } = useContext ( AppContext )
  const { i18n } = useTranslation()
  const [ routes, setRoutes ] = useState([])

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
    <DialogRoot open={open} onClose={handleClose} className={classes.root}>
      <DialogTitle className={classes.title}>{stopList[stops[0][1]].name[i18n.language]}</DialogTitle>
      <DialogContent>
        <List>
          {routes.map(route => (
            <SuccinctTimeReport key={route} routeId={route} />
          ))}
        </List>
      </DialogContent>
    </DialogRoot>
  )
}

const PREFIX = 'stopDialog'

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`
}

const DialogRoot = styled(Dialog)(({theme}) => ({
  [`&.${classes.root}`]: {
    '& .MuiPaper-root': {
      width: '100%',
      marginTop: '90px',
      height: 'calc(100vh - 100px)'
    }
  },
  [`& .${classes.title}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.main,
    color: theme.palette.mode === 'dark' ? theme.palette.primary.main: theme.palette.text.primary,
  }
}))

export default StopDialog