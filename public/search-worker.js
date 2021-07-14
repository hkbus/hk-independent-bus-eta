const dfsRoutes = [] 
const routePrev = {}
const stopPrev = {}

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

const submitResult = () => {
  postMessage(dfsRoutes)
  dfsRoutes.splice(0)
}

const dfs = (routeList, stopList, curLocation, targetLocation, lv, routeFrom = '', tmpRoute = '') => {
  if ( getDistance(curLocation, targetLocation) < 500 ) {
    dfsRoutes.push(tmpRoute)
    if (dfsRoutes.length > 10) {
      submitResult()
    }
    return true
  } else if ( lv == 0 ) {
    return false
  }
  
  // find nearby stops
  const stopIds = Object.keys(stopList)
    .filter(stopId => getDistance(stopList[stopId].location, curLocation) < 500)

  // iterate all route
  for (var routeId of Object.keys(routeList)) {
    if ( !routePrev[routeId] ) routePrev[routeId] = {}
    if ( routeFrom in routePrev[routeId] ) continue
    routePrev[routeId][routeFrom] = 1
    // take bus in nearby stops
    for (var stopId of stopIds ) {    
      for (var stops of Object.values(routeList[routeId].stops)) {
        let stopIdx = stops.indexOf(stopId)
        // skip if not valid route in current stop
        if ( stopIdx === -1 ) break
        // take off the bus
        for (stopIdx += 1; stopIdx < stops.length; ++stopIdx ) {
          if ( dfs(routeList, stopList, stopList[stops[stopIdx]].location, targetLocation, lv - 1, routeId, tmpRoute + '|' + `${routeId}/${stopIdx}` ) ) {
            if ( lv == 1 ) return true
          }
        }
      }
    }
  }
  return false
}

onmessage = (e) => {
  const {routeList, stopList, start, end, lv} = e.data
  for (var i=1;i<=lv;++i ) {
    dfs(routeList, stopList, start, end, i)
  }
  submitResult()
}