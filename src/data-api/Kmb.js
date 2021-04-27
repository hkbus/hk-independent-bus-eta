import moment from 'moment'

const KmbApi = {
  co: 'kmb',
  fetchRouteList: () => (
    // fetch route data
    fetch(
      "https://data.etabus.gov.hk/v1/transport/kmb/route/"
    ).then(
      response => response.json()
    ).then( ({data}) => 
      data.reduce( (routeList, element) => {
        routeList[[element.route, element.service_type, element.bound].join('+')] = {
          route: element.route,
          co: 'kmb',
          bound: element.bound,
          orig: {
            en: element.orig_en,
            zh: element.orig_tc
          },
          dest: {
            en: element.dest_en,
            zh: element.dest_tc
          },
          stops: [],
          serviceType: element.service_type
        }
        return routeList
      }, {})
    ).then( routeList => (
      // fetch route stop data
      fetch("https://data.etabus.gov.hk/v1/transport/kmb/route-stop/").then(response => response.json())
      .then(({data, generated_timestamp}) => {
        data.forEach(element => {
          routeList[[element.route, element.service_type, element.bound].join('+')].stops.push(
            element.stop
          )
        })
        return Object.entries(routeList).map(([id, obj]) => obj)
      })
    ))
  ),
  fetchStopList: () => {
    return fetch("https://data.etabus.gov.hk/v1/transport/kmb/stop").then(
      response => response.json()
    ).then(({data, generated_timestamp}) => {
      let stopList = {}
      data.forEach(element => {
        stopList[element.stop] = {
          name: {
            en: element.name_en,
            zh: nameEncodingHandling( element.name_tc )
          },
          location: {
            lat: element.lat,
            long: element.long
          }
        }
      })
      
      return stopList
    })
  },
  /*
    @fetchEtas
    return array of Object with props {
      eta: (int) minute or null,
      remark: {
        zh: string
        en: string
      }
    }
  */
  fetchEtas: ({stopId, route, seq, serviceType, bound}) => {
    return fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/${serviceType}`,
      { cache: "no-store" }
    ).then( response => response.json() )
    .then(({data}) => data.filter(e => e.dir === bound && e.seq === seq).map(e => ({
        eta: e.eta ? Math.round(moment(e.eta).diff(moment()) / 60 / 1000) : e.eta,
        remark: {
          zh: e.rmk_tc,
          en: e.rmk_en
        },
        co: 'kmb'
      }))
    )
  }
}

export default KmbApi

const nameEncodingHandling = (name) => {
  if ( name === '瘝嗵眎�𧨾���' ) return '沙田坳道'
  else if ( name === '暺�憭找�嗵��' ) return '黃大仙站'
  else return name
}