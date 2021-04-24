import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import MuiAccordion from'@material-ui/core/Accordion'
import MuiAccordionSummary from'@material-ui/core/AccordionSummary'
import MuiAccordionDetails from'@material-ui/core/AccordionDetails'
import {
  Box, Typography
} from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import AppContext from '../AppContext'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const RouteEta = () => {
  const { id } = useParams()
  const [ expanded, setExpanded ] = useState(false)
  const { routeList, stopList } = useContext ( AppContext )
  const [route, service_type] = id.split('+').slice(0,2)
  const { t, i18n } = useTranslation()

  const handleChange = ( panel ) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  } 

  const classes = useStyles()

  return (
    <Box className={classes.boxContainer}>
      {
        routeList[id].stops.map((stop, idx) => (
          <Accordion 
            key={'stop-'+idx} 
            expanded={expanded === idx}
            onChange={handleChange(idx)}
            TransitionProps={{unmountOnExit: true}}
          >
            <AccordionSummary>{stopList[stop].name[i18n.language]}</AccordionSummary>
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
  const [ etas, setEtas ] = useState(null)
  const { route, stopId, serviceType } = props

  const fetchEta = () => {
    const fetchData = async () => {
      const response = await fetch(
        `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/${serviceType}`
      )
      const result = await response.json()
      let _etas = []
      result.data.forEach(e => {
        _etas.push( {
          eta: e.eta ? Math.trunc(moment(e.eta).diff(moment()) / 60 / 1000) : e.eta,
          remark: {
            zh: e.rmk_tc,
            en: e.rmk_en
          }
        })
      })
      setEtas(_etas)
    }
    fetchData()
  }

  useEffect( () => {
    fetchEta()
    const fetchEtaInterval = setInterval(() => {
      fetchEta()
    }, 30000)

    return () => clearInterval(fetchEtaInterval)
  }, [])

  if ( etas == null ) {
    return (
      <>　</>
    )
  }

  const displayMsg = (eta, t) => {
    let ret = ''
    switch (eta) {
      case null: 
        break
      case 0: 
        ret = '- '+t('分鐘')
        break
      default:
        ret = eta + t('分鐘')
        break
    }
    return ret
  }

  return (
    <div>
      {
        etas.length === 0 ? t('暫無班次') : (
          etas.map(eta => (
            <Typography variant="subtitle1" key={`route-${stopId}`}>
              {displayMsg(eta.eta, t)} - {eta.remark[i18n.language]}
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

const useStyles = makeStyles(theme => ({
  boxContainer: {
    height: '500px',
    overflowY: 'scroll'
  }
}))