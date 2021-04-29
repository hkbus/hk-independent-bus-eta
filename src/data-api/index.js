import KmbApi from './Kmb'
import NwfbApi from './Nwfb'
import CtbApi from './Ctb'

const fetchEtas = async ( {route, routeStops, bound, seq, serviceType, co }) => {
  let _etas = []
  for ( const company_id of co ) {
    if (company_id === 'kmb' && routeStops.kmb ){
      _etas = _etas.concat( await KmbApi.fetchEtas({
        route,
        stopId: routeStops.kmb[seq-1], 
        seq: (seq === routeStops.kmb.length ? 1000 : seq), 
        serviceType, bound: bound[company_id]}) 
      )
    }
    else if ( company_id === 'ctb' && routeStops.ctb ) {
      _etas = _etas.concat( await CtbApi.fetchEtas({stopId: routeStops.ctb[seq-1], route, bound: bound[company_id] }))
    }
    else if ( company_id === 'nwfb' && routeStops.nwfb ) {
      _etas = _etas.concat( await NwfbApi.fetchEtas({stopId: routeStops.nwfb[seq-1], route, bound: bound[company_id] }))
    }
  }

  return _etas.sort((a,b) => { 
    if ( a.eta === '' ) return 1
    else if ( b.eta === '' ) return -1
    return a.eta < b.eta ? -1 : 1
  })
}

const fetchRouteStops = ( {route, bound, stops} ) => (
  Promise.all([KmbApi, NwfbApi, CtbApi].map(api => 
    !stops[api.co] ? api.fetchRouteStops( { route, bound: bound[api.co] } ) : null
  ).filter(v => v))
)

const checkSameName = ( a, b ) => {
  const name_a = a.toUpperCase()
  const name_b = b.toUpperCase()
  return name_a.includes(name_b) || name_b.includes(name_a)
}

const checkSameRoute = (route1, route2) => (
  route1.route === route2.route && route1.co !== route2.co && ['orig', 'dest'].map ( end => {
    // check if either orig or dest name is the same
    return checkSameName(route1[end].en, route2[end].en)
  }).includes(true)
)

const convertRouteObj = (routeObj) => {
  let ret = {
    route: routeObj.route,
    co: [routeObj.co],
    bound: {},
    orig: {
      en: routeObj.orig.en,
      zh: routeObj.orig.zh
    },
    dest: {
      en: routeObj.dest.en,
      zh: routeObj.dest.zh
    },
    stops: {},
    serviceType: routeObj.serviceType
  }
  ret.stops[routeObj.co] = routeObj.stops
  ret.bound[routeObj.co] = routeObj.bound
  return ret
}

const fetchRouteList = () => (
  Promise.all([KmbApi, NwfbApi, CtbApi].map(api => api.fetchRouteList()))
  .then( companyRoutes => {
    let routeList = {}
    const routes = companyRoutes.reduce((acc, list) => acc.concat(list)).sort((a, b) => {
      return a.route < b.route ? -1 : 0
    })
    let i, j
    for ( i = 0; i < routes.length; ++i ){
      // ignore imported routes
      if ( routes[i].imported ) continue
      let routeObj = convertRouteObj(routes[i])
      for ( j = i + 1; j < routes.length; ++j ) {
        if ( routes[i].route !== routes[j].route ) break
        if ( routes[j].imported ) continue
        if ( checkSameRoute(routes[i], routes[j]) ) {
          routeObj.co.push(routes[j].co)
          routeObj.stops[routes[j].co] = routes[j].stops
          routeObj.bound[routes[j].co] = routes[j].bound
          // mark imported
          routes[j].imported = true
        }
      }
      
      routeList[`${routeObj.route}+${routeObj.serviceType}+${routeObj.orig.en}+${routeObj.dest.en}`] = routeObj
    }
    
    // sort the routeList by route no.
    let _routeList = routeList
    routeList = {}
    Object.entries(_routeList).sort((a,b) => (a[0] < b[0] ? -1 : 1)).forEach(([routeNo, route]) => {
      routeList[routeNo] = route
    })

    return routeList
  })
)

const fetchStopRoutes = ( stopId, routeList ) => (
  Promise.all([KmbApi, NwfbApi, CtbApi].map( api => 
  //Promise.all([NwfbApi].map( api => 
    api.fetchStopEtas(stopId)
  )).then(arr => [].concat.apply([], arr))
  .then(etas => (
    Object.entries(routeList)
    .map( ([routeId, routeObj]) => {
      for ( const eta of etas) {
        if (routeObj.route === eta.route
          && routeObj.serviceType === eta.serviceType
          && routeObj.bound[eta.co] === eta.bound
          && checkSameName(routeObj.dest.en, eta.dest.en)
        ) {
          return `${routeId}/${eta.seq-1}`
        } 
      }
      return null
    }).filter(routeId => routeId) 
  ))
)

export { KmbApi, NwfbApi, CtbApi, fetchEtas, fetchRouteStops, fetchRouteList, fetchStopRoutes }