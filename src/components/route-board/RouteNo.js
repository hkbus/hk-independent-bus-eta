import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const RouteNo = ({ routeNo }) => {
  const classes = useStyles()
  const [prefix, suffix] = routeNo.match(/[A-Z]+$/) ? [routeNo.slice(0,-1), routeNo.slice(-1)] : [routeNo, '']
  return (
    <>
      <span className={classes.routePrefix} >{prefix}</span>
      <span className={classes.routeSuffix} >{suffix}</span>
    </>
  )
}

export default RouteNo

const useStyles = makeStyles(theme => ({
  routePrefix: {
    fontSize: '1.2rem',
    fontFamily: '"Oswald", sans-serif'
  },
  routeSuffix: {
    fontSize: '0.95rem',
    fontFamily: '"Oswald", sans-serif'
  }
}))