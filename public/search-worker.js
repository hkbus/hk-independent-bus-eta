let routePrev = {}
const routeLv = {}
const bestRouteStop = {}
const stopRoute = {}
const dfsRoutes = []

const getDistance = (a, b) => {
  const R = 6371e3; // metres
  const φ1 = a.lat * Math.PI/180; // φ, λ in radians
  const φ2 = b.lat * Math.PI/180;
  const Δφ = (b.lat-a.lat) * Math.PI/180;
  const Δλ = (b.lng-a.lng) * Math.PI/180;

  const aa = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
  return R * c; // in metres
}

const submitResult = (routeList, stopList, end) => {
  const _ret = dfsRoutes
    .map(v => v.split('|').filter(t => t))
    .map(routes => (
      routes.map(route => {
        const [routeId, stopIdx] = route.split('/')
        const [on, off] = stopIdx.split('-').map(v => parseInt(v, 10))
        return { routeId, on, off }
      })
    ))
  // find best end location
  _ret.forEach( routes => {
    const {routeId, off} = routes[routes.length - 1]
    const dist = getDistance( end, stopList[Object.values(routeList[routeId].stops).sort((a,b) => b.length - a.length)[0][off]].location )
    if ( !bestRouteStop[routeId] ) bestRouteStop[routeId] = [-1, 1000]
    if ( bestRouteStop[routeId][1] > dist ) 
      bestRouteStop[routeId] = [off, dist]
  } )
  // filter route to select only the nearest off stop
  const ret = _ret.filter( routes => {
    const {routeId, off} = routes[routes.length-1]
    return bestRouteStop[routeId][0] === off
  })
  dfsRoutes.splice(0)
  postMessage({type: "result", value: ret})
}

const buildStopRoute = (routeList) => {
  Object.entries(routeList).forEach(([routeId, {stops}]) => {
    Object.values(stops).forEach((_stops) => {
      _stops.forEach( stop => {
        if ( !stopRoute[stop] ) stopRoute[stop] = []
        stopRoute[stop].push(routeId)
      })
    })
  })
}

const dfs = (routeList, stopList, curLocation, targetLocation, curDepth, maxDepth, routeFrom = '', tmpRoute = '') => {
  if ( getDistance(curLocation, targetLocation) < 500 ) {
    if ( curDepth == 0 ) {
      dfsRoutes.push(tmpRoute)
      routeLv[routeFrom] = maxDepth - curDepth
    }
    return true
  } else if ( curDepth == 0 ) {
    return false
  }
  
  // find nearby stops
  const stopIds = Object.keys(stopList)
    .filter(stopId => getDistance(stopList[stopId].location, curLocation) < 500)

  // sort out available routes by nearby stops 
  // fix bug of taking late stop for circular route
  const availableRoutes = {}
  stopIds.forEach( stopId => {
    if ( !stopRoute[stopId] ) return; // skip if the stop have no route
    stopRoute[stopId].forEach(routeId => {
      const seq = Object.values(routeList[routeId].stops).reduce( (minIdx, stops) => Math.max( stops.indexOf(stopId), minIdx ), -1 )
      if ( !availableRoutes[routeId] || availableRoutes[routeId][0] > seq) availableRoutes[routeId] = [seq, stopId]
    })
  } )

  let found = false
  // take bus in nearby stops
  Object.entries(availableRoutes)
  .map(([k,v]) => [k, v[1]])
  .forEach( ([routeId, stopId]) => {
    if ( !routePrev[routeId] ) routePrev[routeId] = {}
    if ( routeFrom in routePrev[routeId] ) return; // skip if same kind of route exchange has been taken before
    if ( routeLv[routeId] < maxDepth ) return; // skip if this route can directly arrive

    routePrev[routeId][routeFrom] = 1
    for (var stops of Object.values(routeList[routeId].stops)) {
      const stopIdx = stops.indexOf(stopId)
      if ( stopIdx === -1 ) continue // skip if no take up stop is found
      // take off the bus
      for (var idx = stopIdx + 1; idx < stops.length; ++idx ) {
        if ( dfs(routeList, stopList, stopList[stops[idx]].location, targetLocation, curDepth - 1, maxDepth, routeId, tmpRoute + '|' + `${routeId}/${stopIdx}-${idx}` ) ) {
          routeLv[routeFrom] = maxDepth - curDepth
          found = true
        }
      }
    }
  })
  return found
}

onmessage = (e) => {
  const {routeList, stopList, start, end, maxDepth} = e.data
  buildStopRoute(routeList)
  let count = 0
  for (var i=1;i<=maxDepth;++i ) {
    routePrev = {}
    dfs(routeList, stopList, start, end, i, i)
    count = dfsRoutes.length
    submitResult(routeList, stopList, end)
  }
  postMessage({type: "done", count: count})
}