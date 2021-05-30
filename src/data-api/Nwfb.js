import moment from 'moment'

const NwfbApi = {
  co: 'nwfb',
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