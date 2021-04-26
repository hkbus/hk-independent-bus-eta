import React, { useEffect, useState } from 'react'
import { KmbApi, fetchRouteList } from './data-api'

const AppContext = React.createContext()

export const AppContextProvider = ( props ) => {
  const [schemaVersion, setSchemaVersion] = useState(localStorage.getItem('schemaVersion'))
  // route list & stop list & route-stop list
  const [routeList, setRouteList] = useState(JSON.parse(localStorage.getItem('routeList')))
  const [stopList, setStopList] = useState(JSON.parse(localStorage.getItem('stopList')))
  const [updateTime, setUpdateTime] = useState(parseInt(localStorage.getItem('updateTime')))
  // search route
  const [searchRoute, setSearchRoute] = useState("")
  // selected route for bottom navigation shortcut
  const [selectedRoute, setSelectedRoute] = useState("1+1+I")
  // Geo Permission for UX
  const [ geoPermission, setGeoPermission ] = useState( localStorage.getItem('geoPermission') ) 

  // possible Char for RouteInputPad
  const [possibleChar, setPossibleChar] = useState([])
  
  const renewDb = () => {
    fetchRouteList().then( _routeList => updateRouteList(_routeList) ).then(() =>
      // fetch only KMB stop list as the api return is succinct enough
      // on-the-fly fetching for other service providers' stops
      KmbApi.fetchStopList().then( _stopList => {
        updateStopList(_stopList)
        const _updateTime = Date.now()
        setUpdateTime ( _updateTime )
        localStorage.setItem('updateTime', _updateTime)
      } )
    )
  }

  useEffect(() => {
    // check app version and flush localstorage if outdated
    fetch( process.env.PUBLIC_URL + '/schema-version.txt').then(
      response => response.text()
    ).then( _schemaVersion => {
      let needRenew = false
      if ( schemaVersion !== _schemaVersion ) {
        setSchemaVersion(_schemaVersion)
        localStorage.setItem('schemaVersion', _schemaVersion)
        needRenew = true
      }
      needRenew = needRenew || routeList == null || stopList == null || updateTime == null || updateTime < Date.now() - 7 * 24 * 60 * 60 * 1000
      if (needRenew) {
        renewDb()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPossibleChar(getPossibleChar(searchRoute, routeList))
  }, [searchRoute, routeList])

  const updateStopList = (_stopList) => {
    // caching localStorage
    localStorage.setItem('stopList', JSON.stringify(_stopList))
    setStopList(_stopList)
  }

  const updateRouteList = (_routeList) => {
    if ( typeof(_routeList) === 'function' ) {
      _routeList = _routeList(routeList)
    }
    // caching localStorage
    localStorage.setItem('routeList', JSON.stringify(_routeList))
    setRouteList(_routeList)
  }

  const updateSearchRouteByButton = (buttonValue) => {
    switch (buttonValue) {
      case 'b': 
        setSearchRoute(searchRoute.slice(0,-1))
        break
      case '-':
        setSearchRoute('')
        break
      default: 
        setSearchRoute(searchRoute+buttonValue)
    }
  }


  const updateGeoPermission = ( state ) => {
    setGeoPermission(state)
    localStorage.setItem('geoPermission', state)
  }

  return (
    <AppContext.Provider value={{
        routeList, updateRouteList, stopList, updateStopList,
        searchRoute, setSearchRoute, updateSearchRouteByButton,
        selectedRoute, setSelectedRoute,
        possibleChar,
        // settings
        renewDb, schemaVersion, updateTime,
        geoPermission, updateGeoPermission 
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
      possibleChar[route[0].slice(searchRoute.length, searchRoute.length+1)] = true
    }
  })
  return Object.entries(possibleChar).map(k => k[0]).filter(k => k !== '+')
}