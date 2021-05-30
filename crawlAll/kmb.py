import requests
import json
from os import path
import asyncio
import copy

def getRouteStop(co = 'kmb'):
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
        r = requests.get('https://data.etabus.gov.hk/v1/transport/'+co+'/route/')
        for route in r.json()['data']:
            route['stops'] = {}
            routeList['+'.join([route['route'], route['service_type'], route['bound']])] = route

        # load route stops
        r = requests.get('https://data.etabus.gov.hk/v1/transport/'+co+'/route-stop/')
        for stop in r.json()['data']:
            routeKey = '+'.join([stop['route'], stop['service_type'], stop['bound']])
            if routeKey in routeList:
                routeList[routeKey]['stops'][int(stop['seq'])] = stop['stop']
            else:
                # if route not found, clone it from service type = 1
                _routeKey = '+'.join([stop['route'], str('1'), stop['bound']])
                routeList[routeKey] = copy.deepcopy(routeList[_routeKey])
                routeList[routeKey]['stops'] = {}
                routeList[routeKey]['stops'][int(stop['seq'])] = stop['stop']

        # flatten the route stops back to array
        for routeKey in routeList.keys():
            stops = [routeList[routeKey]['stops'][seq] for seq in sorted(routeList[routeKey]['stops'].keys())]
            routeList[routeKey]['stops'] = stops

        # flatten the routeList back to array
        routeList = [routeList[routeKey] for routeKey in routeList.keys()]


    stopList = {}
    if path.isfile(STOP_LIST):
        with open(STOP_LIST) as f:
            stopList = json.load(f)
    else:
        # load stops
        r = requests.get('https://data.etabus.gov.hk/v1/transport/'+co+'/stop')
        _stopList = r.json()['data']
        for stop in _stopList:
            stopList[stop['stop']] = stop
   
    with open(ROUTE_LIST, 'w') as f:
        f.write(json.dumps(routeList, ensure_ascii=False))
    with open(STOP_LIST, 'w') as f:
        f.write(json.dumps(stopList, ensure_ascii=False))

getRouteStop()
