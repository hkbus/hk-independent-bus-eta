import React, { useEffect, useState } from 'react'
import moment from 'moment'

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
    // KMB
    let routeList = {}
    let response = await fetch("https://data.etabus.gov.hk/v1/transport/kmb/route/")
    let result = await response.json()
    result.data.forEach(element => {
      routeList[element.route+'+'+element.service_type+"+"+element.bound+'+kmb'] = {
        orig: {
          en: element.orig_en,
          zh: element.orig_tc
        },
        dest: {
          en: element.dest_en,
          zh: element.dest_tc
        },
        stops: []
      }
    })
    response = await fetch("https://data.etabus.gov.hk/v1/transport/kmb/route-stop/")
    result = await response.json()
    result.data.forEach(element => {
      routeList[element.route+'+'+element.service_type+'+'+element.bound+'+kmb'].stops.push(element.stop)
    })
    localStorage.setItem('routeList', JSON.stringify(routeList))
    localStorage.setItem('routeListDbTime', result.generated_timestamp)
  } 
}

const fetchStopList = async () => {
  if ( localStorage.getItem('stopList') == null ||
    localStorage.getItem('stopDbTime') < moment().subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ssZZ")
  ) {
    // KMB
    let stopList = {}
    const response = await fetch("https://data.etabus.gov.hk/v1/transport/kmb/stop")
    const result = await response.json()
    result.data.forEach(element => {
      stopList[element.stop] = {
        name: {
          en: element.name_en,
          zh: element.name_tc
        },
        location: {
          lat: element.lat,
          long: element.long
        }
      }
    })
    localStorage.setItem('stopList', JSON.stringify(stopList))
    localStorage.setItem('stopDbTime', result.generated_timestamp)
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