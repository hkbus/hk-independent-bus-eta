import React, { useContext, useEffect, useState, useRef } from 'react'
import { vibrate } from './utils'
import DbContext from './DbContext'

const AppContext = React.createContext()

export const AppContextProvider = ( props ) => {
  const { AppTitle, db, renewDb } = useContext(DbContext)
  const { routeList } = db

  // search route
  const [searchRoute, setSearchRoute] = useState("")
  // selected route for bottom navigation shortcut
  const [selectedRoute, setSelectedRoute] = useState('1-1-CHUK-YUEN-ESTATE-STAR-FERRY')
  // Geo Permission for UX
  const [ geoPermission, setGeoPermission ] = useState( localStorage.getItem('geoPermission') ) 
  const [ geolocation, setGeolocation ] = useState (JSON.parse(localStorage.getItem('geolocation')) || {lat: 22.302711, lng: 114.177216})
  const geoWatcherId = useRef ( null )

  // hot query count
  const [ hotRoute, setHotRoute ] = useState( JSON.parse(localStorage.getItem('hotRoute')) || {} )
  const [ savedEtas, setSavedEtas ] = useState ( JSON.parse(localStorage.getItem('savedEtas')) || [] )

  // possible Char for RouteInputPad
  const [possibleChar, setPossibleChar] = useState(getPossibleChar(searchRoute, routeList) || [])

  // color mode
  const devicePreferColorScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const [ colorMode, setColorMode ] = useState(localStorage.getItem('colorMode') || devicePreferColorScheme )

  // energy saving mode
  const [ energyMode, setEnergyMode ] = useState(JSON.parse(localStorage.getItem('energyMode')) || false)

  // check if window is on active in mobile
  const [isVisible, setIsVisible] = useState(true)
  const onVisibilityChange = () => setIsVisible(!document.hidden)

  useEffect(() => {
    if ( geoPermission === 'granted' ) {
      const _geoWatcherId = navigator.geolocation.watchPosition(({coords: {latitude, longitude}}) => {
        updateGeolocation({lat: latitude, lng: longitude})
      })
      geoWatcherId.current = _geoWatcherId
    }
    window.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      if ( geoWatcherId.current ) navigator.geolocation.clearWatch(geoWatcherId.current)
      window.removeEventListener("visibilitychange", onVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateGeoPermission = (geoPermission, deniedCallback) => {
    if ( geoPermission === 'opening' ) {
      setGeoPermission('opening')
      const _geoWatcherId = navigator.geolocation.watchPosition(({coords: {latitude, longitude}}) => {
        updateGeolocation({lat: latitude, lng: longitude})
        setGeoPermission('granted')
        localStorage.setItem('geoPermission', 'granted')
      }, () => {
        setGeoPermission('denied')
        localStorage.setItem('geoPermission', 'denied')
        if (deniedCallback) deniedCallback()
      })
      geoWatcherId.current = _geoWatcherId
    } else if ( geoWatcherId.current ) {
      navigator.geolocation.clearWatch(geoWatcherId.current)
      geoWatcherId.current = null
      setGeoPermission(geoPermission)
      localStorage.setItem('geoPermission', geoPermission)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  const updateGeolocation = (geolocation) => {
    localStorage.setItem('geolocation', JSON.stringify(geolocation))
    setGeolocation(geolocation)
  }

  const toggleColorMode = () => setColorMode(prevColorMode => {
    const colorMode = prevColorMode === 'dark' ? 'light' : 'dark'
    localStorage.setItem('colorMode', colorMode)
    return colorMode
  })

  const toggleEnergyMode = () => setEnergyMode(prevEnergyMode => {
    const energyMode = !prevEnergyMode
    localStorage.setItem('energyMode', JSON.stringify(energyMode))
    return energyMode
  })
  
  const updateSearchRouteByButton = (buttonValue) => {
    vibrate(1)
    setTimeout(() => {
      setSearchRoute(prevSearchRoute => {
        let ret
        switch (buttonValue) {
          case 'b': 
            ret = prevSearchRoute.slice(0,-1)
            break
          case 'c':
            ret = ''
            break
          default: 
            ret = prevSearchRoute + buttonValue
        }
        setPossibleChar( getPossibleChar(ret, routeList) )
        return ret
      })
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
      if ( prevSavedEtas.includes(key) ) {
        prevSavedEtas.splice( prevSavedEtas.indexOf(key), 1 )
        localStorage.setItem('savedEtas', JSON.stringify(prevSavedEtas))
        return JSON.parse(JSON.stringify(prevSavedEtas))
      }
      const newSavedEtas = prevSavedEtas.concat(key).filter( (v, i, s) => s.indexOf(v) === i )
      localStorage.setItem('savedEtas', JSON.stringify(newSavedEtas))
      return newSavedEtas
    })
  }

  const resetUsageRecord = () => {
    setHotRoute({})
    updateGeolocation({lat: 22.302711, lng: 114.177216})
    setSavedEtas([])
  }

  return (
    <AppContext.Provider value={{
        AppTitle, db,
        searchRoute, setSearchRoute, updateSearchRouteByButton,
        selectedRoute, updateSelectedRoute,
        possibleChar,
        // UX
        hotRoute, geolocation, updateGeolocation,
        savedEtas, updateSavedEtas,
        resetUsageRecord, isVisible,
        // settings
        renewDb,
        geoPermission, updateGeoPermission,
        colorMode , toggleColorMode,
        energyMode, toggleEnergyMode
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
  return Object.entries(possibleChar).map(k => k[0]).filter(k => k !== '-')
}
