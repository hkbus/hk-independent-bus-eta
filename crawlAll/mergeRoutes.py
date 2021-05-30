import json
from haversine import haversine, Unit

routeList = []
stopList = {}
stopMap = {}

def getRouteObj ( route, co, stops, bound, orig, dest, seq, fares, serviceType = 1):
    return {
        'route': route,
        'co': co,
        'stops': stops,
        'serviceType': serviceType,
        'bound': bound,
        'orig': orig,
        'dest': dest,
        'fares': fares,
        'seq': seq
    }
    
def importRouteListJson( co ):
    _routeList = json.load(open('routeFareList.%s.json'%co))
    _stopList = json.load(open('stopList.%s.json'%co))
    for stopId, stop in _stopList.items():
        if stopId not in stopList:
            stop['lat'] = float(stop['lat'])
            stop['lng'] = float(stop['long'])
            stopList[stopId] = stop
    
    for _route in _routeList:
        found = False
        orig = {'en': _route['orig_en'].replace('/', '／'), 'zh': _route['orig_tc'].replace('/', '／')}
        dest = {'en': _route['dest_en'].replace('/', '／'), 'zh': _route['dest_tc'].replace('/', '／')}
        for route in routeList:
            if _route['route'] == route['route'] and co in route['co']:
                if len(_route['stops']) == route['seq']:
                    dist = 0
                    merge = True
                    for stop_a, stop_b in zip( _route['stops'], route['stops'][0][1] ):
                        stop_a = stopList[stop_a]
                        stop_b = stopList[stop_b]
                        dist = haversine( (stop_a['lat'], stop_a['lng']), (stop_b['lat'], stop_b['lng']) ) * 1000 # in meter 
                        merge = merge and dist < 300
                    if merge:
                        found = True
                        route['stops'].append((co, _route['stops']))
                        for i in range(0, route['seq']):
                            if route['stops'][0][0] == co:
                                # skip if same company
                                continue
                            if route['stops'][0][1][i] not in stopMap:
                                stopMap[route['stops'][0][1][i]] = [(co, _route['stops'][i])]
                            elif (co, _route['stops'][i]) not in stopMap[route['stops'][0][1][i]]:
                                stopMap[route['stops'][0][1][i]].append( (co, _route['stops'][i]) )
                            if _route['stops'][i] not in stopMap:
                                stopMap[_route['stops'][i]] = [(route['stops'][0][0], route['stops'][0][1][i])]
                            elif (route['stops'][0][0], route['stops'][0][1][i]) not in stopMap[_route['stops'][i]]:
                                stopMap[_route['stops'][i]].append( (route['stops'][0][0], route['stops'][0][1][i]) )

        if not found:
            routeList.append( 
                getRouteObj(
                    route = _route['route'], 
                    co = _route['co'], 
                    serviceType = _route.get('service_type', 1), 
                    stops = [(co, _route['stops'])],
                    bound = _route['bound'],
                    orig = orig,
                    dest = dest,
                    fares = _route.get('fares', None),
                    seq = len(_route['stops'])
                )
            )

def isMatchStops(stops_a, stops_b, debug = False):
    for v in stops_a:
        if stopMap.get(v, [[None,None]])[0][1] in stops_b:
            return True
    return False

def smartUnique():
    _routeList = []
    for i in range(len(routeList)):
        if routeList[i].get('skip', False):
            continue
        founds = []
        # compare route one-by-one
        for j in range(i+1, len(routeList)):
            if routeList[i]['route'] == routeList[j]['route'] and \
                len(routeList[i]['stops']) == len(routeList[j]['stops']) and \
                len([co for co in routeList[i]['co'] if co in routeList[j]['co']]) == 0 and \
                isMatchStops(routeList[i]['stops'][0][1], routeList[j]['stops'][0][1]):
                founds.append( j )
        # update obj
        for found in founds:
            routeList[i]['co'].extend(routeList[found]['co'])
            routeList[i]['stops'].extend( routeList[found]['stops'] )
            routeList[found]['skip'] = True

        # append return array
        _routeList.append(routeList[i])
    return _routeList
            
importRouteListJson('kmb')
importRouteListJson('nwfb')
importRouteListJson('ctb')
routeList = smartUnique()
for route in routeList:
    route['stops'] = {co: stops for co, stops in route['stops']}

with open( 'routeFareList.json', 'w' ) as f:
    f.write(json.dumps({
        'routeList': {('%s+%s+%s+%s'%(v['route'], v['serviceType'], v['orig']['en'], v['dest']['en'])): v for v in routeList},
        'stopList': stopList
    }, ensure_ascii=False))
