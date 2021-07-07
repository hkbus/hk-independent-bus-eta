import React from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const RouteNo = ({ routeNo, component, align }) => {
  const classes = useStyles()
  const [prefix, suffix] = routeNo.match(/[A-Z]+$/) ? [routeNo.slice(0,-1), routeNo.slice(-1)] : [routeNo, '']
  return (
    <Typography component={component || "h2"} align={align} variant="caption" className={classes.root}>
      <span className={classes.routePrefix} >{prefix}</span>
      <span className={classes.routeSuffix} >{suffix}</span>
    </Typography>
  )
}

export default RouteNo

const useStyles = makeStyles(theme => ({
  root: {
    lineHeight: 'normal',
    display: "inline"
  },
  routePrefix: {
    fontSize: '1.2rem',
    fontFamily: '"Oswald", sans-serif'
  },
  routeSuffix: {
    fontSize: '0.95rem',
    fontFamily: '"Oswald", sans-serif'
  }
}))