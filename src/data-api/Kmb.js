const KmbApi = {
  co: 'kmb',
  fetchRouteList: async () => {
    let routeList = {}
    let response = await fetch("https://data.etabus.gov.hk/v1/transport/kmb/route/")
    let result = await response.json()
    result.data.forEach(element => {
      routeList[[element.route, element.service_type, element.bound].join('+')] = {
        co: ['kmb'],
        orig: {
          en: element.orig_en,
          zh: element.orig_tc
        },
        dest: {
          en: element.dest_en,
          zh: element.dest_tc
        },
        stops: []
      }
    })
    response = await fetch("https://data.etabus.gov.hk/v1/transport/kmb/route-stop/")
    result = await response.json()
    result.data.forEach(element => {
      routeList[[element.route, element.service_type, element.bound].join('+')].stops.push(element.stop)
    })
    return [routeList, result.generated_timestamp]
  },
  fetchStopList: async () => {
    let stopList = {}
    const response = await fetch("https://data.etabus.gov.hk/v1/transport/kmb/stop")
    const result = await response.json()
    result.data.forEach(element => {
      stopList[element.stop] = {
        name: {
          en: element.name_en,
          zh: element.name_tc
        },
        location: {
          lat: element.lat,
          long: element.long
        }
      }
    })
    return [stopList, result.generated_timestamp]
  }
}

export default KmbApi