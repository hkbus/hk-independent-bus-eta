import React, {useState, useEffect} from 'react'
import { parseStringPromise } from 'xml2js'
import fares from './data-api/fare.json'
import routeList from './data-api/routeList.json'

const checkSameName = ( a, b ) => {
  const name_a = a.toUpperCase().replace(' RD', ' ROAD').replaceAll(' ', '')
  const name_b = b.toUpperCase().replace(' RD', ' ROAD').replaceAll(' ', '')
  return name_a.includes(name_b) || name_b.includes(name_a)
}

const Test = () => {
  const [string, setString] = useState('')
  const [debugString, setDebugString] = useState('')
  const [debugRoute, setDebugRoute] = useState('')

  useEffect(() => {
    let ret = '';
    ([routeList, fares]).forEach( listObj => {
      Object.keys(listObj).forEach ( id => {
        if ( id.split("+")[0] === debugRoute )
          ret += id + "\n"
      })
      ret += "-\n"
    })
    ret += "\n"
    setDebugString(ret)
  },[debugRoute])

  useEffect(() => {
    localStorage.setItem('fares', JSON.stringify(fares))
    let count = 0
    let ret = ''

    Object.keys(routeList).forEach( id => {
      const [route, serviceType, orig, dest] = id.replace('／', '/').split('+')
      let matched = false
      Object.keys(fares).forEach ( fareId => {
        const [fareRoute, fareOrig, fareDest] = fareId.replace('／', '/').split('+')
        if ( route === fareRoute 
          && checkSameName(orig, fareOrig)
          && checkSameName(dest, fareDest) ) {
          matched = true
        }
      } )
      if (!matched) {
        //console.log(route, orig, dest)
        ret += `${route} + ${orig} + ${dest}\n`
        count += 1
      }
    })
    ret = count + "\n" + ret
    setString(ret)
    return
    Promise.all([
      fetch('https://static.data.gov.hk/td/routes-fares-xml/ROUTE_BUS.xml').then(r => r.text()).then(parseStringPromise), 
      fetch('https://static.data.gov.hk/td/routes-fares-xml/FARE_BUS.xml').then(r => r.text()).then(parseStringPromise)
    ])
    .then( ([{dataroot: {ROUTE: routes}}, {dataroot: {FARE: fares}}]) => {
      const routeFareList = routes.reduce((acc, route) => {
        acc[route.ROUTE_ID] = {
          co: route.COMPANY_CODE.map(co => co.toLowerCase()),
          route: route.ROUTE_NAMEC[0].toUpperCase(),
          orig: route.LOC_START_NAMEE[0].toUpperCase(),
          dest: route.LOC_END_NAMEE[0].toUpperCase(),
          fares: {}
        }
        return acc
      } ,{})
      fares.forEach(fare => {
        const routeSeq = fare.ROUTE_SEQ[0]
        if (!routeFareList[fare.ROUTE_ID].fares.hasOwnProperty(routeSeq)) {
          routeFareList[fare.ROUTE_ID].fares[routeSeq] = []
        }
        routeFareList[fare.ROUTE_ID].fares[routeSeq][parseInt(fare.ON_SEQ[0], 10)] = fare.PRICE[0]
      })
      
      Object.keys(routeFareList).forEach(routeId => {
        routeFareList[routeId].fares = Object.entries(routeFareList[routeId].fares).map(([routeSeq, fareList]) => {
          let ret = []
          let lastFare = undefined
          fareList.forEach(( v, idx, self ) => {
            if ( lastFare !== v ) {
              lastFare = v
              ret.push({
                s: idx,
                f: v
              })
            }
          })
          return [routeSeq, ret]
        }).reduce((acc, [routeSeq, fareList]) => {
          acc[routeSeq] = fareList
          return acc
        }, {})
      })
      let routeFares = {}
      Object.entries(routeFareList).forEach(([id, {route, orig, dest, fares}]) => {
        routeFares[`${route}+${orig}+${dest}`] = fares[1]
        if ( Object.keys(fares).length === 2 ) {
          routeFares[`${route}+${orig}+${dest}`] = fares[1]
          routeFares[`${route}+${dest}+${orig}`] = fares[2]
        }
      })
      console.log(routeFares)
      localStorage.setItem('routeFares', JSON.stringify(routeFares))
    })
    // eslint-disable-next-line 
  }, [])

  return (
    <>
      <input onChange={e => setDebugRoute(e.target.value)} value={debugRoute} />
      <pre>{debugString}</pre>
      <pre>{string}</pre>
    </>
  )
}

export default Test