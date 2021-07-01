import React, { useEffect, useState } from 'react'
import { fetchEtaObj, fetchEtaObjMd5 } from 'hk-bus-eta' 
import { vibrate } from './utils'

const AppContext = React.createContext()

export const AppContextProvider = ( props ) => {
  const AppTitle = '巴士到站預報 App'
  const [schemaVersion, setSchemaVersion] = useState(localStorage.getItem('schemaVersion'))
  const [versionMd5, setVersionMd5] = useState(localStorage.getItem('versionMd5'))
  // route list & stop list & route-stop list
  const [routeList, setRouteList] = useState(JSON.parse(localStorage.getItem('routeList')))
  const [stopList, setStopList] = useState(JSON.parse(localStorage.getItem('stopList')))
  const [stopMap, setStopMap] = useState(JSON.parse(localStorage.getItem('stopMap')))
  const [updateTime, setUpdateTime] = useState(parseInt(localStorage.getItem('updateTime'), 10))
  // search route
  const [searchRoute, setSearchRoute] = useState("")
  // selected route for bottom navigation shortcut
  const [selectedRoute, setSelectedRoute] = useState('1+1+CHUK YUEN ESTATE+STAR FERRY')
  // Geo Permission for UX
  const [ geoPermission, setGeoPermission ] = useState( localStorage.getItem('geoPermission') ) 
  const [ geolocation, setGeolocation ] = useState (JSON.parse(localStorage.getItem('geolocation')) || {lat: 22.302711, lng: 114.177216})
  const [ geoWatcherId, setGeoWatcherId ] = useState ( null )

  // hot query count
  const [ hotRoute, setHotRoute ] = useState( JSON.parse(localStorage.getItem('hotRoute')) || {} )
  const [ savedEtas, setSavedEtas ] = useState ( JSON.parse(localStorage.getItem('savedEtas')) || [] )

  // possible Char for RouteInputPad
  const [possibleChar, setPossibleChar] = useState([])
  
  const renewDb = () => {
    fetchEtaObj().then( ({routeList, stopList, stopMap}) => {
      setRouteList(routeList)
      setStopList(stopList)
      setStopMap(stopMap)
      setUpdateTime( Date.now() )
    })
  }

  useEffect(() => {
    // check app version and flush localstorage if outdated
    Promise.all([
      fetch(process.env.PUBLIC_URL+'/schema-version.txt').then(r => r.text()),
      fetchEtaObjMd5()
    ]).then( ([_schemaVersion, _md5] ) => {
      let needRenew = false
      if ( schemaVersion !== _schemaVersion ) {
        setSchemaVersion(_schemaVersion)
        localStorage.setItem('schemaVersion', _schemaVersion)
        needRenew = true
      }
      if ( versionMd5 !== _md5 ) {
        setVersionMd5(_md5)
        localStorage.setItem('versionMd5', _md5)
        needRenew = true
      }
      needRenew = needRenew || routeList == null || stopList == null
      if (needRenew) {
        renewDb()
      }
    })

    if ( geoPermission === 'granted' ) {
      const _geoWatcherId = navigator.geolocation.watchPosition(({coords: {latitude, longitude}}) => {
        setGeolocation({lat: latitude, lng: longitude})
      })
      setGeoWatcherId ( _geoWatcherId )
    }
    return () => {
      if ( geoWatcherId ) navigator.geolocation.clearWatch(geoWatcherId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if ( geoPermission === 'granted' ) {
      const _geoWatcherId = navigator.geolocation.watchPosition(({coords: {latitude, longitude}}) => {
        setGeolocation({lat: latitude, lng: longitude})
      })
      setGeoWatcherId ( _geoWatcherId )
    } else if ( geoWatcherId ) {
      navigator.geolocation.clearWatch(geoWatcherId)
      setGeoWatcherId(null)
    }
    localStorage.setItem('geoPermission', geoPermission)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoPermission])

  useEffect(() => {
    setPossibleChar(getPossibleChar(searchRoute, routeList))
  }, [searchRoute, routeList])

  useEffect(() => {
    localStorage.setItem('savedEtas', JSON.stringify(savedEtas))
  }, [savedEtas])

  useEffect(() => {
    localStorage.setItem('stopList', JSON.stringify(stopList))
  }, [stopList])

  useEffect(() => {
    localStorage.setItem('stopMap', JSON.stringify(stopMap))
  }, [stopMap])

  useEffect(() => {
    localStorage.setItem('routeList', JSON.stringify(routeList))
  }, [routeList])

  useEffect(() => {
    localStorage.setItem('updateTime', updateTime)
  }, [updateTime])

  useEffect(() => {
    localStorage.setItem('geolocation', JSON.stringify(geolocation))
  }, [geolocation])

  const updateSearchRouteByButton = (buttonValue) => {
    vibrate(1)
    setTimeout(() => {
      switch (buttonValue) {
        case 'b': 
          setSearchRoute(searchRoute => searchRoute.slice(0,-1))
          break
        case '-':
          setSearchRoute('')
          break
        default: 
          setSearchRoute(searchRoute => searchRoute+buttonValue)
      }
    }, 0)
  }

  const updateSelectedRoute = ( route, seq = '' ) => {
    setSelectedRoute ( `${route}/${seq}` )
    if ( seq ) {
      setHotRoute( prevHotRoute => {
        prevHotRoute[route+'/'+seq] = hotRoute[route+'/'+seq] ? hotRoute[route+'/'+seq] + 1 : 1
        localStorage.setItem('hotRoute', JSON.stringify(prevHotRoute))
        return prevHotRoute
      })
    }
  }

  const updateSavedEtas = ( key ) => {
    setSavedEtas ( prevSavedEtas => {
      if ( prevSavedEtas.includes(key) ) return prevSavedEtas.filter(k => k !== key)
      else return prevSavedEtas.concat(key)
    })
  }

  const resetUsageRecord = () => {
    setHotRoute({})
    setGeolocation({lat: 22.302711, lng: 114.177216})
    setSavedEtas([])
  }

  return (
    <AppContext.Provider value={{
        AppTitle,
        routeList, stopList, stopMap,
        setRouteList, setStopList,
        searchRoute, setSearchRoute, updateSearchRouteByButton,
        selectedRoute, updateSelectedRoute,
        possibleChar,
        // UX
        hotRoute, geolocation, setGeolocation,
        savedEtas, updateSavedEtas,
        resetUsageRecord,
        // settings
        renewDb, schemaVersion, versionMd5, updateTime,
        geoPermission, setGeoPermission 
      }}
    >
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContext

const getPossibleChar = ( searchRoute, routeList ) => {
  if ( routeList == null ) return []
  let possibleChar = {}
  Object.entries(routeList).forEach(route => {
    if ( route[0].startsWith(searchRoute.toUpperCase()) ) {
      let c = route[0].slice(searchRoute.length, searchRoute.length+1)
      possibleChar[c] = isNaN(possibleChar[c]) ? 1 : ( possibleChar[c] + 1)
    }
  })
  return Object.entries(possibleChar).map(k => k[0]).filter(k => k !== '+')
}
