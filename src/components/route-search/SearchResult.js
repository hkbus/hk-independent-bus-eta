import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Accordion, AccordionSummary, AccordionDetails, ListItemText, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import AppContext from '../../AppContext'
import RouteNo from '../route-list/RouteNo'
import TimeReport from '../route-eta/TimeReport'

const SearchResult = ({routes, idx, handleRouteClick, expanded, stopIdx}) => {
  const {db: {routeList, stopList}} = useContext(AppContext)
  const {t, i18n} = useTranslation()
  useStyles()

  const getStopString = (routes) => {
    const ret = []
    routes.forEach(selectedRoute => {
      const {routeId, on} = selectedRoute
      const {fares, stops} = routeList[routeId]
      ret.push(stopList[Object.values(stops).sort((a,b) => b.length - a.length)[0][on]].name[i18n.language] + (fares ? ` ($${fares[on]})` : ''))
    })
    const {routeId, off} = routes[routes.length-1]
    const {stops} = routeList[routeId]
    return ret.concat(stopList[Object.values(stops).sort((a,b) => b.length - a.length)[0][off]].name[i18n.language]).join(' → ')
  }

  return (
    <Accordion 
      TransitionProps={{unmountOnExit: true}}
      classes={{root: "search-accordion-root", expanded: 'search-accordion-expanded'}}
      onChange={() => handleRouteClick(idx)}
      expanded={expanded}
    >
      <AccordionSummary classes={{root: "search-accordionSummary-root", content: "search-accordionSummary-content", expanded: "search-accordionSummary-expanded"}}>
        <ListItemText
          primary={
            routes.map((selectedRoute, routeIdx) => {
              const {routeId} = selectedRoute
              const {route, serviceType} = routeList[routeId]
              
              return (
                <span className="search-routeNo" key={`search-${idx}-${routeIdx}`}>
                  <RouteNo routeNo={route} />
                  {serviceType >= 2 && <Typography variant="caption" className={"search-result-specialTrip"}>{t('特別班')}</Typography>}
                </span>
              )
            })
          }
          secondary={getStopString(routes)}
        />
      </AccordionSummary>
      <AccordionDetails classes={{root: "search-accordionDetails-root"}}>
        {routes.map((selectedRoute, routeIdx) => (
          <TimeReport 
            key={`timereport-${idx}-${routeIdx}`}
            routeId={selectedRoute.routeId.toUpperCase()}
            seq={selectedRoute.on + ( stopIdx ? stopIdx[routeIdx] : 0 )}
            containerClass={"search-timereport-container"}
            showStopName={true}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default SearchResult

const useStyles = makeStyles(theme => ({
  '@global': {
    ".search-routeNo": {
      width: '50%',
      display: 'inline-block'
    },
    ".search-result-fare": {
      fontSize: '0.8rem',
      marginLeft: '3px'
    },
    ".search-result-specialTrip": {
      fontSize: '0.6rem',
      marginLeft: '8px'
    },
    '.search-accordion-root': {
      border: '1px solid rgba(0, 0, 0, .125)',
      boxShadow: 'none'
    },
    '.search-accordion-root:not(:last-child)': {
      borderBottom: 0,
    },
    '.search-accordion-root:before': {
      display: 'none',
    },
    '.search-accordion-root.search-accordion-expanded': {
      margin: 'auto',
    },
    '.search-accordionSummary-root': {
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.default : 'rgba(0, 0, 0, .03)',
      borderBottom: '1px solid rgba(0, 0, 0, .125)',
      marginBottom: -1,
      minHeight: 44
    },
    '.search-accordionSummary-root.search-accordionSummary-expanded': {
      minHeight: 44
    },
    '.search-accordionSummary-content': {
      margin: '8px 0',
      flexDirection: 'column'
    },
    '.search-accordionSummary-content.search-accordionSummary-expanded': {
      margin: '8px 0'
    },
    '.search-accordionDetails-root': {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1)
    },
    ".search-timereport-container": {
      width: '50%'
    }
  }

}))