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

export { KmbApi, NwfbApi, CtbApi, fetchEtas, fetchRouteStops }