import moment from 'moment'

const NwfbApi = {
  co: 'nwfb',
  fetchRouteList: () => (
    fetch("https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/nwfb")
      .then(response => response.json())
      .then(({data, generated_timestamp}) => {
        let routeList = {}
        data.forEach(element => {
          routeList[[element.route,'1','O'].join('+')] = {
            orig: {
              en: element.orig_en,
              zh: element.orig_tc
            },
            dest: {
              en: element.dest_en,
              zh: element.dest_tc
            },
            co: ['nwfb'],
            stops: {
              nwfb: null
            }
          }
          routeList[[element.route,'1','I'].join('+')] = {
            dest: {
              en: element.orig_en,
              zh: element.orig_tc
            },
            orig: {
              en: element.dest_en,
              zh: element.dest_tc
            },
            co: ['nwfb'],
            stops: {
              nwfb: null
            }
          }
        })
        return [routeList, generated_timestamp]
      })
  ),
  fetchRouteStops: ({route, bound, routeList}) => {
    // fetch route stop first
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
              zh: data.name_tc,
              en: data.name_en
            },
            location: {
              lat: data.lat,
              long: data.long
            }
          }))
        )).then( stops => {
          let stopList = {};
          stops.forEach(stop => stopList[stop.stopId] = stop)
          return {routeStops, stopList, co: 'nwfb'}
        })
    })
  },
  fetchEtas: ({stopId, route, bound }) => {
    return fetch(`https://rt.data.gov.hk/v1/transport/batch/stop-eta/NWFB/${stopId}?lang=zh-hant`).then(
      response => response.json()
    ).then(({data}) => data.filter(eta => eta.route === route && eta.dir === bound && eta.eta).map(e => ({
        eta: e.eta ? Math.trunc(moment(e.eta).diff(moment()) / 60 / 1000) : e.eta,
        remark: {
          zh: e.rmk,
          en: e.rmk
        }
      }))
    )
  }
}

export default NwfbApi