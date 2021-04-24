import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { KmbApi, NwfbApi, CtbApi } from './data-api'

const AppContext = React.createContext()

export const AppContextProvider = ( props ) => {
  // route list & stop list & route-stop list
  const [routeList, setRouteList] = useState(null)
  const [stopList, setStopList] = useState(null)
  // search route
  const [searchRoute, setSearchRoute] = useState("")

  // possible Char for RouteInputPad
  const [possibleChar, setPossibleChar] = useState([])
  
  useEffect(() => {
    fetchRouteList().then(() => {
      let _routeList = JSON.parse(localStorage.getItem('routeList'))
      setRouteList(_routeList)
      setPossibleChar(getPossibleChar('', _routeList))
    })
    fetchStopList().then(() => {
      let _stopList = JSON.parse(localStorage.getItem('stopList'))
      setStopList(_stopList)
    }) 
  }, [])

  useEffect(() => {
    setPossibleChar(getPossibleChar(searchRoute, routeList))
  }, [searchRoute, routeList])

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

  return (
    <AppContext.Provider value={{
        routeList, setRouteList, stopList, setStopList,
        searchRoute, setSearchRoute, updateSearchRouteByButton,
        possibleChar
      }}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContext

const fetchRouteList = async () => {
  if ( localStorage.getItem('routeList') == null || 
    localStorage.getItem('routeListDbTime') < moment().subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ssZZ")
  ) {
    let routeList = {}
    let generated_timestamp = '3000'
    for ( const api of [KmbApi, NwfbApi, CtbApi] ) {
        let [_routeList, _generated_timestamp] = await api.fetchRouteList()
        // merging routes from different service provider
        for ( const route of Object.entries(_routeList) ) {
          if ( route[0] in routeList ) {
            if ( route[1].orig.zh === routeList[route[0]].orig.zh ) {
              // same route
              routeList[route[0]].co.push(api.co)
            } else {
              // new route with same route number
              routeList[route[0]+'+'+api.co] = route[1]
            }
          } else {
            // new route
            routeList[route[0]] = route[1]
          }
        }
        generated_timestamp = _generated_timestamp < generated_timestamp ? _generated_timestamp : generated_timestamp
    }
    // sort the routeList
    let _routeList = routeList
    routeList = {}
    Object.entries(_routeList).sort((a,b) => (a[0] < b[0] ? -1 : 1)).forEach(route => {
      routeList[route[0]] = route[1]
    })
    
    // save to local storage
    localStorage.setItem('routeList', JSON.stringify(routeList))
    localStorage.setItem('routeListDbTime', generated_timestamp)
  } 
}

const fetchStopList = async () => {
  if ( localStorage.getItem('stopList') == null ||
    localStorage.getItem('stopDbTime') < moment().subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ssZZ")
  ) {
    // KMB
    let [stopList, generated_timestamp] = await KmbApi.fetchStopList()
    localStorage.setItem('stopList', JSON.stringify(stopList))
    localStorage.setItem('stopDbTime', generated_timestamp)
  }
}

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