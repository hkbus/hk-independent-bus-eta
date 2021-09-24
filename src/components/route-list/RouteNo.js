import React from 'react'
import { Typography } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles';

const RouteNo = ({ routeNo, component, align }) => {
  useStyles()
  const [prefix, suffix] = routeNo.match(/[A-Z]+$/) ? [routeNo.slice(0,-1), routeNo.slice(-1)] : [routeNo, '']
  return (
    <Typography component={component || "h2"} align={align} variant="caption" color="textPrimary" className={"routeNo-root"}>
      <span className={"routeNo-routePrefix"} >{prefix}</span>
      <span className={"routeNo-routeSuffix"} >{suffix}</span>
    </Typography>
  )
}

export default RouteNo

const useStyles = makeStyles(theme => ({
  "@global": {
    ".routeNo-root": {
      lineHeight: 'normal',
      display: "inline",
    },
    ".routeNo-routePrefix": {
      fontSize: '1.2rem',
      fontFamily: '"Oswald", sans-serif',
    },
    ".routeNo-routeSuffix": {
      fontSize: '0.95rem',
      fontFamily: '"Oswald", sans-serif',
    }
  }
}))