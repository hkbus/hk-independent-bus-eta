import React, { useContext, useEffect, useState, useRef } from 'react'
import { Box, CircularProgress, Divider, Paper, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import AddressInput from '../components/route-search/AddressInput'
import SearchResult from '../components/route-search/SearchResult'
import SearchMap from '../components/route-search/SearchMap'
import { fetchEtas } from 'hk-bus-eta'
import { setSeoHeader } from '../utils'

const RouteSearch = () => {
  const { t, i18n } = useTranslation()
  const { 
    AppTitle, geolocation,
    db: {routeList, stopList}
  } = useContext(AppContext)
  const [locations, setLocations] = useState({
    start: geolocation,
    end: null
  })
  const [status, setStatus] = useState("ready")
  const [result, setResult] = useState([])
  const [routeIdx, setRouteIdx] = useState(0)
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
        // sort route by number of stops
        .map(route => ([route, route.reduce((sum, r) => sum + r.off - r.on, 0)])) 
        .sort( (a, b) => a[1] - b[1])
        .map(route => route[0])
      ])
    })
  }

  useEffect(() => {
    setSeoHeader ({
      title: t('點對點路線搜尋') + ' - ' + t(AppTitle),
      description: t('route-search-page-description'),
      lang: i18n.language
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

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
  }, [status, locations])

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
    if ( !v || !(v.lat && v.lng) ) return
    setLocations({
      ...locations,
      end: v ? {lat: v.lat, lng: v.lng} : null
    })
    setStatus('waiting')
    setResult([])
  }

  const handleRouteClick = (idx) => {
    setRouteIdx(idx)
  }
  
  return (
    <Paper className={"search-root"} square elevation={0}>
      <SearchMap routes={result[routeIdx]} start={locations.start} end={locations.end} />
      <div className={"search-input-container"}>
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
      </div>
      <Box className={"search-result-list"}>
        {
          !locations.start || !locations.end ? <RouteSearchDetails /> : (
          'waiting|rendering'.includes(status) && result.length === 0 ? <CircularProgress size={30} className={"search-route-loading"} /> : (
          'ready|waiting|rendering'.includes( status ) && result.length ? (
            result.map((routes, resIdx) => (
              <SearchResult 
                key={`search-result-${resIdx}`} 
                routes={routes} 
                idx={resIdx}
                handleRouteClick={handleRouteClick}
                expanded={resIdx === routeIdx}
              />
            ))
          ) : <>{t("找不到合適的巴士路線")}</> ))
        }
      </Box>
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
      textAlign: 'left'
    },
    '.search-input-container': {
      marginTop: '2%',
      padding: '0% 2%' 
    },
    ".search-description": {
      textAlign: "left",
      marginTop: '5%',
      padding: '5%'
    },
    ".search-result-list": {
      overflowY: 'scroll',
      height: 'calc(100% - 30vh - 76px)'
    },
    ".search-route-loading": {
      margin: '10%'
    }
  }
}))