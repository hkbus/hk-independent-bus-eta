import moment from 'moment'

const CtbApi = {
  co: 'ctb',
  fetchRouteList: () => (
    fetch("https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/ctb")
      .then(response => response.json())
      .then(({data}) => (
        data.reduce((acc, element) => (
          acc.concat([ {
            route: element.route,
            bound: 'O',
            orig: {
              en: element.orig_en,
              zh: element.orig_tc
            },
            dest: {
              en: element.dest_en,
              zh: element.dest_tc
            },
            co: 'ctb',
            stops: null,
            serviceType: 1
          },{
            route: element.route,
            bound: 'I',
            orig: {
              en: element.dest_en,
              zh: element.dest_tc
            },
            dest: {
              en: element.orig_en,
              zh: element.orig_tc
            },
            co: 'ctb',
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
      `https://rt.data.gov.hk/v1/transport/citybus-nwfb/route-stop/CTB/${route}/${dir}`
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
              zh: data.name_tc,
              en: data.name_en
            },
            location: {
              lat: parseFloat(data.lat),
              lng: parseFloat(data.long)
            }
          }))
        )).then( stops => {
          let stopList = {};
          stops.forEach(stop => stopList[stop.stopId] = stop)
          return {routeStops, stopList, co: 'ctb'}
        })
    })
  },
  fetchEtas: ({stopId, route, bound }) => {
    return fetch(`https://rt.data.gov.hk/v1/transport/batch/stop-eta/CTB/${stopId}?lang=zh-hant`, { cache: "no-store" }).then(
      response => response.json()
    ).then(({data}) => data.filter(eta => eta.eta && eta.route === route && eta.dir === bound).map(e => ({
        eta: e.eta ? Math.round(moment(e.eta).diff(moment()) / 60 / 1000) : e.eta,
        remark: {
          zh: e.rmk,
          en: e.rmk
        },
        co: 'ctb'
      }))
    )
  },
  fetchStopEtas: ( stopId ) => (
    fetch(`https://rt.data.gov.hk/v1/transport/batch/stop-eta/CTB/${stopId}?lang=zh-hant`, { cache: "no-store" })
    .then(response => response.json())
    .then(({data}) => data.map( e => ({
      eta: e.eta ? Math.round(moment(e.eta).diff(moment()) / 60 / 1000) : e.eta,
      remark: {
        zh: e.rmk,
        en: e.rmk
      },
      co: 'ctb'
    })) )
  )
}

export default CtbApi