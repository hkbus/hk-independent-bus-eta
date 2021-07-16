import React, { useContext, useEffect, useState, useRef } from 'react'
import { List, Paper, Divider, ListItem, ListItemText, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import AddressInput from '../components/route-search/AddressInput'
import RouteNo from '../components/route-list/RouteNo'
import { fetchEtas } from 'hk-bus-eta'

const RouteSearch = () => {
  const { t, i18n } = useTranslation()
  const { 
    geolocation,
    db: {routeList, stopList}
  } = useContext(AppContext)
  const [locations, setLocations] = useState({
    start: geolocation,
    end: null
  })
  const [status, setStatus] = useState("ready")
  const [result, setResult] = useState([])
  useStyles()

  const worker = useRef(undefined)
  const terminateWorker = () => {
    if ( worker.current ) {
      worker.current.terminate()
      worker.current = undefined
    }
  }
  
  const updateRoutes = (routes) => {
    const uniqueRoutes = routes.reduce((acc, routeArr) => acc.concat(routeArr.map(r => r.routeId)), []).filter((v, i, s) => s.indexOf(v) === i)
    
    // check currently available routes by fetching ETA
    Promise.all(uniqueRoutes.map(routeId => fetchEtas({
        ...routeList[routeId], 
        seq: 0, 
        routeStops: routeList[routeId].stops,
        co: Object.keys(routeList[routeId].stops)
    }))).then(etas => 
      // filter out non available route
      uniqueRoutes.filter((routeId, idx) => etas[idx].length && etas[idx].reduce((acc, eta) => {return acc || eta.eta}, null))
    ).then( availableRoutes => {
      setResult(prevResult => [...prevResult,
        // save current available route only
        ...routes.filter( route => (
          route.reduce((ret, r) => {
            return ret && availableRoutes.indexOf( r.routeId ) !== -1
          }, true)
        ))
      ])
    })
  }

  useEffect(() => {
    // update status if status is rendering
    if ( status === 'rendering' ) {
      setStatus('ready')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  useEffect(() => {
    if (status === 'waiting' && locations.start && locations.end) {
      if ( window.Worker ) {
        terminateWorker()
        worker.current = new Worker('/search-worker.js')
        worker.current.postMessage({routeList, stopList, 
          start: locations.start,
          end: locations.end, 
          maxDepth: 2
        })
        worker.current.onmessage = (e) => {
          if ( e.data.type === 'done' ) {
            terminateWorker()
            // set status to rendering result if result not empty
            setStatus( e.data.count ? 'rendering' : 'ready')
            return
          }
          updateRoutes(e.data.value.sort((a, b) => a.length - b.length))
        }
      }
    }
    
    return () => {
      terminateWorker()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

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

  const handleStartChange = ( {value: { location: v } } ) => {
    if ( !v || !(v.lat && v.lng) ) return;
    setLocations({
      ...locations,
      start: v ? {lat: v.lat, lng: v.lng} : geolocation
    })
    setStatus('waiting')
    setResult([])
  }

  const handleEndChange = ( {value: { location: v } } ) => {
    if ( !v || !(v.lat && v.lng) ) return;
    setLocations({
      ...locations,
      end: v ? {lat: v.lat, lng: v.lng} : null
    })
    setStatus('waiting')
    setResult([])
  }
  
  return (
    <Paper className={"search-root"} square elevation={0}>
      <AddressInput
        placeholder={t("你的位置")}
        onChange={handleStartChange}
        stopList={stopList}
      />
      <AddressInput
        placeholder={t("目的地")}
        onChange={handleEndChange}
        stopList={stopList}
      />
      <List className={"search-result-list"}>
        {
          !locations.start || !locations.end ? <RouteSearchDetails /> : (
          'waiting|rendering'.includes(status) && result.length === 0 ? t("搜尋中...") : (
          'ready|waiting|rendering'.includes( status ) && result.length ? (
            result.map((routes, resIdx) => (
              <div key={`search-${resIdx}`}>
                <ListItem className={"search-result-container"}>
                  <ListItemText
                    primary={
                      routes.map((selectedRoute, routeIdx) => {
                        const {routeId} = selectedRoute
                        const {route, serviceType} = routeList[routeId]
                        
                        return (
                          <span className="search-routeNo" key={`search-${resIdx}-${routeIdx}`}>
                            <RouteNo routeNo={route} />
                            {serviceType >= 2 && <Typography variant="caption" className={"search-result-specialTrip"}>{t('特別班')}</Typography>}
                          </span>
                        )
                      })
                    }
                    secondary={getStopString(routes)}
                  />
                </ListItem>
                <Divider />
              </div>
            ))
          ) : <>{t("找不到合適的巴士路線")}</> ))
        }
      </List>
    </Paper>
  )
}

const RouteSearchDetails = () => {
  const { t } = useTranslation()
  return (
    <div className={"search-description"}>
      <Typography variant="h5">{t('Route Search header')}</Typography>
      <Divider />
      <Typography variant="subtitle1">{t('Route Search description')}</Typography>
      <br/>
      <Typography variant="body2">{t('Route Search constraint')}</Typography>
      <Typography variant="body2">1. {t('Route Search caption 1')}</Typography>
      <Typography variant="body2">2. {t('Route Search caption 2')}</Typography>
      <Typography variant="body2">3. {t('Route Search caption 3')}</Typography>
    </div>
  )
}

export default RouteSearch

const useStyles = makeStyles(theme => ({
  "@global": {
    ".search-root": {
      background: theme.palette.type === 'dark' ? theme.palette.background.default : 'white',
      height: 'calc(100vh - 125px)',
      overflowY: 'hidden',
      textAlign: 'center'
    },
    ".search-description": {
      textAlign: "left",
      marginTop: '10%',
      padding: '5%'
    },
    ".search-routeNo": {
      paddingRight: '20%'
    },
    ".search-result-list": {
      overflowY: 'scroll',
      height: 'calc(100% - 76px)'
    },
    ".search-result-container": {
      display: 'flex',
      flexDirection: 'row'
    },
    ".search-result-fare": {
      fontSize: '0.8rem',
      marginLeft: '3px'
    },
    ".search-result-specialTrip": {
      fontSize: '0.6rem',
      marginLeft: '8px'
    }
  }
}))