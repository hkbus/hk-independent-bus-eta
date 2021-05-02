import moment from 'moment'

const NwfbApi = {
  co: 'nwfb',
  fetchRouteList: () => (
    fetch("https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/nwfb")
      .then(response => response.json())
      .then(({data}) => (
        data.reduce((acc, element) => (
          acc.concat([ {
            route: element.route,
            bound: 'O',
            orig: {
              en: element.orig_en.replace('/','／'),
              zh: element.orig_tc.replace('/','／')
            },
            dest: {
              en: element.dest_en.replace('/','／'),
              zh: element.dest_tc.replace('/','／')
            },
            co: 'nwfb',
            stops: null,
            serviceType: 1
          },{
            route: element.route,
            bound: 'I',
            orig: {
              en: element.dest_en.replace('/','／'),
              zh: element.dest_tc.replace('/','／')
            },
            dest: {
              en: element.orig_en.replace('/','／'),
              zh: element.orig_tc.replace('/','／')
            },
            co: 'nwfb',
            stops: null,
            serviceType: 1
          }])
        ), [])
      ))
  ),
  fetchRouteStops: ({route, bound}) => {
    if ( !bound ) return null // route not exist in this company
    const dir = bound === 'I' ? 'inbound' : 'outbound'
    return fetch(
      `https://rt.data.gov.hk/v1/transport/citybus-nwfb/route-stop/NWFB/${route}/${dir}`
    ).then( response => 
      response.json()
    ).then( ({data}) => 
      data.map(e => e.stop) 
    ).then( routeStops => {
      // fetch each stop in parallel
      return Promise.all(routeStops.map(stopId => 
          fetch(`https://rt.data.gov.hk/v1/transport/citybus-nwfb/stop/${stopId}`).then(
            response => response.json()
          ).then ( ({data}) => ({
            stopId: stopId,
            name: {
              zh: data.name_tc.replace('/','／'),
              en: data.name_en.replace('/','／')
            },
            location: {
              lat: parseFloat(data.lat),
              lng: parseFloat(data.long)
            }
          }))
        )).then( stops => {
          let stopList = {};
          stops.forEach(stop => stopList[stop.stopId] = stop)
          return {routeStops, stopList, co: 'nwfb'}
        })
    })
  },
  fetchEtas: ({stopId, route, bound }) => (
    fetch(`https://rt.data.gov.hk//v1/transport/citybus-nwfb/eta/NWFB/${stopId}/${route}`, {cache: 'no-store'}).then(
      response => response.json()
    ).then(({data}) => data.filter(eta => eta.eta && eta.dir === bound).map(e => ({
        eta: e.eta,
        remark: {
          zh: e.rmk_tc,
          en: e.rmk_en
        },
        co: 'nwfb'
      }))
    )
  ),
  fetchStopEtas: ( stopId ) => (
    fetch(`https://rt.data.gov.hk/v1/transport/batch/stop-eta/NWFB/${stopId}`, { cache: "no-store" }).then(
      response => response.json()
    ).then(({data}) => data.map( e => ({
      route: e.route,
      bound: e.dir,
      seq: e.seq,
      eta: e.eta ? Math.round(moment(e.eta).diff(moment()) / 60 / 1000) : e.eta,
      dest: {
        en: e.dest.replace('/','／')
      },
      remark: {
        en: e.rmk
      },
      serviceType: 1,
      co: 'nwfb'
    })))
  )
}

export default NwfbApi