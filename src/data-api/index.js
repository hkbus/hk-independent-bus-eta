import KmbApi from './Kmb'
import NwfbApi from './Nwfb'
import CtbApi from './Ctb'

const fetchEtas = async ( {route, routeStops, bound, seq, serviceType, co, routeSize}) => {
  let _etas = []
  for ( const company_id of co ) {
    if (company_id === 'kmb' && routeStops.kmb ){
      _etas = _etas.concat( await KmbApi.fetchEtas({
        route,
        stopId: routeStops.kmb[seq-1], 
        seq: (seq === routeSize ? 1000 : seq), 
        serviceType, bound}) 
      )
    }
    else if ( company_id === 'ctb' && routeStops.ctb ) {
      _etas = _etas.concat( await CtbApi.fetchEtas({stopId: routeStops.ctb[seq-1], route, bound }))
    }
    else if ( company_id === 'nwfb' && routeStops.nwfb ) {
      _etas = _etas.concat( await NwfbApi.fetchEtas({stopId: routeStops.nwfb[seq-1], route, bound }))
    }
  }
  return _etas.sort((a,b) => a.eta < b.eta ? -1 : 1).filter(e => !Number.isInteger(e.eta) || e.eta > 1 )
}

const fetchRouteStops = async ( {route, serviceType, bound, co} ) => {
  let api
  if (co === 'kmb') api = KmbApi
  else if (co === 'nwfb') api = NwfbApi
  else if (co === 'ctb') api = CtbApi
  else {
    console.error(co+' is not a valid company id')
    return null
  }
  return await api.fetchRouteStops({route, serviceType, bound})
}

const checkSameRoute = (route1, route2) => {
  const name_a = route1.orig.en.toUpperCase()
  const name_b = route2.orig.en.toUpperCase()
  return name_a.includes(name_b) || name_b.includes(name_a)
}

const fetchRouteList = () => (
  Promise.all([KmbApi, NwfbApi, CtbApi].map(api => api.fetchRouteList()))
  .then( routeLists => {
    let routeList = {}
    let generated_timestamp = '3000'
    
    routeLists.forEach( companyData => {
      let [companyRouteList, _generated_timestamp] = companyData
      // merging routes from different service provider
      Object.entries(companyRouteList).forEach( ([routeNo, route]) => {
        const co = route.co[0]
        if ( routeNo in routeList ) {
          if ( checkSameRoute(route, routeList[routeNo] ) ) {
            // same route
            routeList[routeNo].co.push(co)
            routeList[routeNo].stops[co] = route.stops[co]
          } else {
            // new route with same route number
            routeList[routeNo+'+'+co] = route
          }
        } else {
          // new route
          routeList[routeNo] = route
        }
      })
      generated_timestamp = _generated_timestamp < generated_timestamp ? _generated_timestamp : generated_timestamp
    })
    
    // sort the routeList by route no.
    let _routeList = routeList
    routeList = {}
    Object.entries(_routeList).sort((a,b) => (a[0] < b[0] ? -1 : 1)).forEach(([routeNo, route]) => {
      routeList[routeNo] = route
    })

    return routeList
  })
)

export { KmbApi, NwfbApi, CtbApi, fetchEtas, fetchRouteStops, fetchRouteList }