import json

with open('routeFare.json') as f:
    routeFare = json.load(f)

def addFound(route, routeObj, fareId):
    route['fares'] = routeObj['fares'][fareId]
    route['co'] = routeObj['co']

def isNameMatch(name_a, name_b):
    tmp_a = name_a.lower()
    tmp_b = name_b.lower()
    return tmp_a.find(tmp_b) >= 0 or tmp_b.find(tmp_a) >= 0

def matchRoutes(co):
    with open( 'routeList.%s.json' % co ) as f:
        routeList = json.load(f)

    for route in routeList:
        found = False
        for routeId, routeObj in routeFare.items():
            if found:
                break
            if route['route'] == routeObj['route'] and co in routeObj['co']:
                if len(route['stops']) - 1 == len(routeObj['fares']['1']) and len(route['stops']) - 1 != len(routeObj['fares'].get('2', [])):
                    addFound(route, routeObj, '1')
                    found = True
                elif len(route['stops']) - 1 == len(routeObj['fares'].get('2', [])) and len(route['stops']) - 1 != len(routeObj['fares']['1']):
                    addFound(route, routeObj, '2')
                    found = True
                elif len(route['stops']) - 1 == len(routeObj['fares']['1']) and len(route['stops']) - 1 == len(routeObj['fares'].get('2', [])):
                    if isNameMatch(route['orig_en'], routeObj['orig']['en']) or isNameMatch(route['dest_en'], routeObj['dest']['en']):
                        addFound(route, routeObj, '1')
                        found = True
                    elif isNameMatch(route['orig_en'], routeObj['dest']['en']) or isNameMatch(route['dest_en'], routeObj['orig']['en']): 

                        addFound(route, routeObj, '2')
                        found = True
                    else:
                        # 99R still missed, need DP?
                        found = False

        if not found:
            route['co'] = [co]

    '''
    for route in routeList:
        if 'fares' not in route:
            print (co, route['route'], route['dest_tc'])
    '''

    with open( 'routeFareList.%s.json' % co, 'w' ) as f:
        f.write(json.dumps(routeList, ensure_ascii=False))

matchRoutes('kmb')
matchRoutes('nwfb')
matchRoutes('ctb')

