import requests
import json
from os import path
import asyncio

def getRouteStop(co):
    # define output name
    ROUTE_LIST = 'routeList.'+co+'.json'
    STOP_LIST = 'stopList.'+co+'.json'

    # load route list and stop list if exist
    routeList = {}
    if path.isfile(ROUTE_LIST):
        with open(ROUTE_LIST) as f:
            routeList = json.load(f)
    else:
        # load routes
        r = requests.get('https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/'+co)
        routeList = r.json()['data']

    _stops = []
    stopList = {}
    if path.isfile(STOP_LIST):
        with open(STOP_LIST) as f:
            stopList = json.load(f)
   
    # function to load single stop info
    def getStop ( stopId ):
        r = requests.get('https://rt.data.gov.hk/v1/transport/citybus-nwfb/stop/'+stopId)
        return r.json()['data']

    # function to async load multiple stops info
    async def getStopList ( stops ):
        loop = asyncio.get_event_loop()
        futures = [loop.run_in_executor(None, getStop, stop) for stop in stops]
        ret = []
        for future in futures:
            ret.append(await future)
        return ret

    def getRouteStop(param):
        co, route = param
        if route.get('bound', 0) != 0 or route.get('stops', {}):
            return route
        route['stops'] = {}
        for direction in ['inbound', 'outbound']:
            r = requests.get('https://rt.data.gov.hk/v1/transport/citybus-nwfb/route-stop/'+co.upper()+'/'+route['route']+"/"+direction)
            route['stops'][direction] = [stop['stop'] for stop in r.json()['data']]
        return route

    async def getRouteStopList ():
        loop = asyncio.get_event_loop()
        futures = [loop.run_in_executor(None, getRouteStop, (co, route)) for route in routeList]
        ret = []
        for future in futures:
            ret.append(await future)
        return ret


    loop = asyncio.get_event_loop()
    routeList = loop.run_until_complete(getRouteStopList())
    for route in routeList:
        for direction, stops in route['stops'].items():
            for stopId in stops:
                _stops.append(stopId)

    # load stops for this route aync
    _stops = list(set(_stops))
    
    stopInfos = list( zip ( _stops, loop.run_until_complete(getStopList(_stops)) ) )
    for stopId, stopInfo in stopInfos:
        stopList[stopId] = stopInfo
    
    _routeList = []
    for route in routeList:
        if route.get('bound', 0) != 0:
            _routeList.append(route)
            continue
        for bound in ['inbound', 'outbound']:
            if len(route['stops'][bound]) > 0:
                _routeList.append({
                    'co': co,
                    'route': route['route'],
                    'bound': 'I' if bound == 'outbound' else 'O',
                    'orig_en': route['orig_en'] if bound == 'outbound' else route['dest_en'],
                    'orig_tc': route['orig_tc'] if bound == 'outbound' else route['dest_tc'],
                    'orig_sc': route['orig_sc'] if bound == 'outbound' else route['dest_sc'],
                    'dest_en': route['dest_en'] if bound == 'outbound' else route['orig_en'],
                    'dest_tc': route['dest_tc'] if bound == 'outbound' else route['orig_tc'],
                    'dest_sc': route['dest_sc'] if bound == 'outbound' else route['orig_sc'],
                    'stops': route['stops'][bound],
                    'serviceType': 0
                })

    with open(ROUTE_LIST, 'w') as f:
        f.write(json.dumps(_routeList, ensure_ascii=False))
    with open(STOP_LIST, 'w') as f:
        f.write(json.dumps(stopList, ensure_ascii=False))

getRouteStop('nwfb')
getRouteStop('ctb')
