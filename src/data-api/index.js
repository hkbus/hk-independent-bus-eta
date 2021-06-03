import KmbApi from './Kmb'
import NwfbApi from './Nwfb'
import CtbApi from './Ctb'
import NlbApi from './Nlb'

// seq is 0-based here
const fetchEtas = async ( {route, routeStops, bound, seq, serviceType, co, nlbId }) => {
  let _etas = []
  for ( const company_id of co ) {
    if (company_id === 'kmb' && routeStops.kmb ){
      _etas = _etas.concat( await KmbApi.fetchEtas({
        route,
        stopId: routeStops.kmb[seq], 
        seq: (seq + 1 === routeStops.kmb.length ? 1000 : seq), 
        serviceType, bound: bound[company_id]}) 
      )
    }
    else if ( company_id === 'ctb' && routeStops.ctb ) {
      _etas = _etas.concat( await CtbApi.fetchEtas({stopId: routeStops.ctb[seq], route, bound: bound[company_id] }))
    }
    else if ( company_id === 'nwfb' && routeStops.nwfb ) {
      _etas = _etas.concat( await NwfbApi.fetchEtas({stopId: routeStops.nwfb[seq], route, bound: bound[company_id] }))
    }
    else if ( company_id === 'nlb' && routeStops.nlb ) {
      console.log(nlbId)
      _etas = _etas.concat( await NlbApi.fetchEtas({stopId: routeStops.nlb[seq], nlbId}) )
    }
  }

  return _etas.sort((a,b) => { 
    if ( a.eta === '' ) return 1
    else if ( b.eta === '' ) return -1
    return a.eta < b.eta ? -1 : 1
  })
}


export { fetchEtas }