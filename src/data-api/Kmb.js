import moment from 'moment'

const KmbApi = {
  co: 'kmb',
  fetchEtas: ({stopId, route, seq, serviceType, bound}) => (
    fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/${serviceType}`,
      { cache: "no-store" }
    ).then( response => response.json() )
    .then(({data}) => data.filter(e => 
      e.dir === bound 
      && e.seq === seq + 1 // api return 1-based seq
    ).map(e => ({
        eta: e.eta,
        remark: {
          zh: e.rmk_tc,
          en: e.rmk_en
        },
        co: 'kmb'
      }))
    )
  ),
  fetchStopEtas: ( stopId ) => (
    fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stopId}`, { cache: "no-store" })
    .then(response => response.json())
    .then(({data}) => data.map( e => ({
      route: e.route,
      bound: e.dir,
      seq: e.seq,
      eta: e.eta ? Math.round(moment(e.eta).diff(moment()) / 60 / 1000) : e.eta,
      dest: {
        zh: e.dest_tc,
        en: e.dest_en
      },
      remark: {
        zh: e.rmk,
        en: e.rmk
      },
      serviceType: e.service_type,
      co: 'kmb'
    })))
  )
}

export default KmbApi