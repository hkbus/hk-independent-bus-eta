import xml.etree.ElementTree as ET
import requests
from os import path

if not path.isfile('ROUTE_BUS.xml'):
    r = requests.get('https://static.data.gov.hk/td/routes-fares-xml/ROUTE_BUS.xml')
    r.encoding = 'utf-8'
    with open('ROUTE_BUS.xml', 'w') as f:
        f.write(r.text)

routeFareList = {}
tree = ET.parse('ROUTE_BUS.xml')
root = tree.getroot()
for route in root.iter('ROUTE'):
    if route.find('ROUTE_TYPE').text == '1':
        routeFareList[route.find('ROUTE_ID').text] = {
            'co': route.find('COMPANY_CODE').text.replace('LWB', 'KMB').lower().split('+'),
            'route': route.find('ROUTE_NAMEC').text,
            'journeyTime': route.find('JOURNEY_TIME').text,
            'fares': {},
            'orig': {
                'zh': route.find('LOC_START_NAMEC').text,
                'en': route.find('LOC_START_NAMEE').text
            },
            'dest': {
                'zh': route.find('LOC_END_NAMEC').text,
                'en': route.find('LOC_END_NAMEE').text
            },
            'special': route.find('SPECIAL_TYPE').text
        }

if not path.isfile('FARE_BUS.xml'):
    r = requests.get('https://static.data.gov.hk/td/routes-fares-xml/FARE_BUS.xml')
    r.encoding = 'utf-8'
    with open('FARE_BUS.xml', 'w') as f:
        f.write(r.text)

tree = ET.parse('FARE_BUS.xml')
root = tree.getroot()

for fare in root.iter('FARE'):
    routeId = fare.find('ROUTE_ID').text
    if routeId not in routeFareList:
        continue
    routeSeq = fare.find('ROUTE_SEQ').text
    if routeSeq not in routeFareList[routeId]['fares']:
        routeFareList[routeId]['fares'][routeSeq] = {}
    onSeq = int(fare.find('ON_SEQ').text)
    price = fare.find('PRICE').text
    if onSeq not in routeFareList[routeId]['fares'][routeSeq]:
        routeFareList[routeId]['fares'][routeSeq][onSeq] = price

import collections
for routeId in routeFareList:
    for fare in routeFareList[routeId]['fares']:
        routeFareList[routeId]['fares'][fare] = [ p for seq, p in collections.OrderedDict(routeFareList[routeId]['fares'][fare].items()).items() ]

import json
with open('routeFare.json', 'w') as f:
    f.write(json.dumps(routeFareList, ensure_ascii=False))
