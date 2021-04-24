const CtbApi = {
  co: 'ctb',
  fetchRouteList: async () => {
    let routeList = {}
    let response = await fetch("https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/ctb")
    let result = await response.json()
    result.data.forEach(element => {
      routeList[[element.route,'1','I'].join('+')] = {
        orig: {
          en: element.orig_en,
          zh: element.orig_tc
        },
        dest: {
          en: element.dest_en,
          zh: element.dest_tc
        },
        co: ['ctb'],
        stops: null
      }
      routeList[[element.route,'1','O'].join('+')] = {
        dest: {
          en: element.orig_en,
          zh: element.orig_tc
        },
        orig: {
          en: element.dest_en,
          zh: element.dest_tc
        },
        co: ['ctb'],
        stops: null
      }
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

export default CtbApi