import React, { useContext, useEffect, useState, useRef } from 'react'
import { List, Paper, Divider, ListItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import AddressInput from '../components/route-search/AddressInput'
import RouteNo from '../components/route-list/RouteNo'

const RouteSearch = () => {
  const { t } = useTranslation()
  const { 
    geolocation,
    db: {routeList, stopList}
  } = useContext(AppContext)
  const [locations, setLocations] = useState({
    start: geolocation,
    end: geolocation, // null
    result: [["30X-1-CYBERPORT-CENTRAL-(EXCHANGE-SQUARE)/10","948-1-CAUSEWAY-BAY-(TIN-HAU)-TSING-YI-(CHEUNG-ON-ESTATE)/14"],["904-1-KENNEDY-TOWN-(BELCHER-BAY)-LAI-CHI-KOK/7","948-1-CAUSEWAY-BAY-(TIN-HAU)-TSING-YI-(CHEUNG-ON-ESTATE)/14"],["904-1-KENNEDY-TOWN-(BELCHER-BAY)-LAI-CHI-KOK/8","N41X-1-HUNG-HOM-STATION-TSING-YI-(CHEUNG-WANG-ESTATE)/21"],["905-1-WAN-CHAI-NORTH-LAI-CHI-KOK/15","948-1-CAUSEWAY-BAY-(TIN-HAU)-TSING-YI-(CHEUNG-ON-ESTATE)/14"],["905-1-WAN-CHAI-NORTH-LAI-CHI-KOK/16","N41X-1-HUNG-HOM-STATION-TSING-YI-(CHEUNG-WANG-ESTATE)/21"],["905A-1-WAN-CHAI-NORTH-LAI-CHI-KOK/15","948-1-CAUSEWAY-BAY-(TIN-HAU)-TSING-YI-(CHEUNG-ON-ESTATE)/14"],["905A-1-WAN-CHAI-NORTH-LAI-CHI-KOK/16","N41X-1-HUNG-HOM-STATION-TSING-YI-(CHEUNG-WANG-ESTATE)/21"],["930A-1-WAN-CHAI-NORTH-TSUEN-WAN-WEST-STATION/9","948-1-CAUSEWAY-BAY-(TIN-HAU)-TSING-YI-(CHEUNG-ON-ESTATE)/14"],["930A-1-WAN-CHAI-NORTH-TSUEN-WAN-WEST-STATION/10","E32-2-KWAI-FONG-(SOUTH)-ASIAWORLD-EXPO/10"],["930A-1-WAN-CHAI-NORTH-TSUEN-WAN-WEST-STATION/11","N43-1-TSUEN-WAN-STATION-TSING-YI-(CHEUNG-WANG-ESTATE)/8"],["A12-1-SIU-SAI-WAN-(ISLAND-RESORT)-AIRPORT/32","948-1-CAUSEWAY-BAY-(TIN-HAU)-TSING-YI-(CHEUNG-ON-ESTATE)/14"]],
    done: true
  })
  const {result, done} = locations
  useStyles()

  const worker = useRef(undefined)
  const terminateWorker = () => {
    if ( worker.current ) {
      worker.current.terminate()
      worker.current = undefined
    }
  }

  useEffect(() => {
    if (!done && locations.start && locations.end) {
      if ( window.Worker ) {
        terminateWorker()
        worker.current = new Worker('/search-worker.js')
        worker.current.postMessage({routeList, stopList, 
          start: locations.start,
          end: locations.end, 
          lv: 2
        })
        worker.current.onmessage = (e) => {
          setLocations({
            ...locations,
            result: e.data.map(routes => routes.split('|').filter(route => route)).sort((a, b) => a.length - b.length),
            done: true
          })
          terminateWorker()
        }
      }
    }
    
    return () => {
      terminateWorker()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations])

  const handleStartChange = ( v ) => {
    setLocations({
      ...locations,
      start: v ? {lat: v.lat, lng: v.lng} : geolocation,
      result: [],
      done: false
    })
  }

  const handleEndChange = ( v ) => {
    setLocations({
      ...locations,
      end: v ? {lat: v.lat, lng: v.lng} : null,
      result: [],
      done: false
    })
  }
  
  return (
    <Paper className={"search-root"} square elevation={0}>
      <AddressInput
        placeholder={t("你的位置")}
        onChange={handleStartChange}
      />
      <AddressInput
        placeholder={t("目的地")}
        onChange={handleEndChange}
      />
      <List className={"search-result-list"}>
        {
          locations.start && locations.end ? (
            result.length ? result.map((routes, resIdx) => <div key={`search-${resIdx}`}>
              <ListItem className={"search-result-container"}>
                {
                  routes.map((route, routeIdx) => {
                    const [routeId] = route.split('/') 
                    return (
                      <div className={"search-routeNo"} key={`search-${resIdx}-${routeIdx}`}>
                        <RouteNo routeNo={routeList[routeId].route} />
                      </div>
                    )
                  })
                }
              </ListItem>
              <Divider />
            </div>): <>{"Loading"}</>
          ) : <></>
        }
      </List>
    </Paper>
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
    ".search-routeNo": {
      minWidth: '20%'
    },
    ".search-result-list": {
      overflowY: 'scroll',
      height: 'calc(100% - 76px)'
    },
    ".search-result-container": {
      display: 'flex',
      flexDirection: 'row'
    }
  }
}))