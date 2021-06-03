import moment from 'moment'

const NlbApi = {
  co: 'nlb',
  fetchEtas: ({stopId, nlbId }) => (
    fetch(`https://rt.data.gov.hk/v1/transport/nlb/stop.php?action=estimatedArrivals`, {
      body: JSON.stringify({
        routeId: nlbId,
        stopId,
        language: 'zh'
      }),
      headers: {
        "Content-Type": "text/plain"
      },
      method: "POST",
      cache: 'no-store'
    }).then(
      response => response.json()
    ).then(({estimatedArrivals}) => {
      if ( !estimatedArrivals ) return []
      return estimatedArrivals.filter(eta => eta.estimatedArrivalTime).map(e => ({
        eta: e.estimatedArrivalTime,
        remark: {
          zh: '',
          en: ''
        },
        co: 'nlb'
      }))
    })
  ),
  fetchStopEtas: ( stopId ) => (
    fetch(`https://rt.data.gov.hk/v1/transport/batch/stop-eta/NLB/${stopId}`, { cache: "no-store" })
    .then( response => {
        if (response.ok)
          return response.json()
        // special handle for NLB API
        throw new Error("Stop not exist")
    }).then(({data}) => data.map( e => ({
      route: e.route,
      eta: e.eta ? Math.round(moment(e.eta).diff(moment()) / 60 / 1000) : e.eta,
      dest: {
        en: e.dest
      },
      remark: {
        en: e.rmk
      },
      co: 'nlb'
    })))
    .catch(() => ([]))
  )
}

export default NlbApi