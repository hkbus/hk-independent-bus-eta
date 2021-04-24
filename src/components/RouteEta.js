import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import MuiAccordion from'@material-ui/core/Accordion'
import MuiAccordionSummary from'@material-ui/core/AccordionSummary'
import MuiAccordionDetails from'@material-ui/core/AccordionDetails'
import {
  Box, Typography
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import AppContext from '../AppContext'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const RouteEta = () => {
  const { id } = useParams()
  const [ stations, setStations ] = useState(null)
  const [ expanded, setExpanded ] = useState(false)
  const { routeList, stopList } = useContext ( AppContext )
  const [route, service_type, bound, co] = id.split('+')

  useEffect (async () => {
    if ( co === 'kmb' ) {
      const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-eta/${route}/${service_type}`)
      const result = await response.json()
      setStations(result.data.filter(eta => eta.dir === bound))
    }
  }, [])
  if ( stations === null ) {
    return (
      <div>Loading</div>
    )
  }
  const handleChange = ( panel ) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  } 

  return (
    <Box>
      {
        routeList[id].stops.map((stop, idx) => (
          <Accordion 
            key={'stop-'+idx} 
            expanded={expanded === idx}
            onChange={handleChange(idx)}
            TransitionProps={{unmountOnExit: true}}
          >
            <AccordionSummary>{stopList[stop].name.zh}</AccordionSummary>
            <AccordionDetails>
              <TimeReport 
                route={route}
                stopId={stop}
                serviceType={service_type}
              />
            </AccordionDetails>
          </Accordion>
        ))
      }
    </Box>
  )
}

export default RouteEta

const TimeReport = ( props ) => {
  const { t, i18n } = useTranslation()
  const [ eta, setEta ] = useState(null)
  const { route, stopId, serviceType } = props
  useEffect( async () => {
    const response = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/${serviceType}`
    )
    const result = await response.json()
    let _eta = []
    result.data.forEach(e => {
      _eta.push( {
        eta: Math.trunc(moment(e.eta).diff(moment()) / 60 / 1000),
        remark: {
          zh: e.rmk_tc,
          en: e.rmk_en
        }
      })
    })
    console.log(_eta)
    setEta(_eta)
  }, [])
  if ( eta == null ) {
    return (
      <></>
    )
  }
  console.log(eta)
  return (
    <div>
      {
        eta.length == 0 ? t('暫無班次') : (
          eta.map(t => (
            <Typography variant="subtitle1">
              {t.eta || '-'}分鐘 - {t.remark[i18n.language]}
            </Typography>
          ))
        )
      }
    </div>
  )
}

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion)

const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);
