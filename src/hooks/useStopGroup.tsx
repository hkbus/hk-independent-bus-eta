import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Company, Eta, fetchEtas } from "hk-bus-eta";
import type { RouteListEntry, StopListEntry } from "hk-bus-eta";
import AppContext from "../context/AppContext";
import { isRouteAvaliable } from "../timetable";
import useLanguage from "./useTranslation";
import DbContext from "../context/DbContext";
import { getDistance, getBearing } from "../utils";

interface useStopGroupProps {
  stopKeys: Array<[Company, string]>;
  routeId : string | undefined;
}
interface StopListEntryExtended extends StopListEntry {
  id : string;
  distance : number;
}
interface RouteKey {
  routeKey : string;
  co : Company;
  seq : number;
}

// stopKey in format "<co>|<stopId>", e.g., "lightRail|LR140"
export const useStopGroup = ({
  stopKeys, routeId
}: useStopGroupProps) => {
  const {
    db: { routeList, stopList, serviceDayMap },
    isTodayHoliday,
  } = useContext(DbContext);
  const { isRouteFilter } = useContext(AppContext);

  // TODO: put it in AppContext user preference
  const DISTANCE_THRESHOLD = 50;
  const BEARING_THRESHOLD = 45;
  const MAX_STOPS_LIMIT = 50;

  const getDistanceStop = (a : StopListEntry, b : StopListEntry) => {
    return getDistance(a.location, b.location);
  };
  const getBearingStops = (a : StopListEntry, b : StopListEntry) => {
    return getBearing(a.location, b.location);
  };
  
  const findRouteStopBearings = (routeStops : RouteKey[]) => {
    // routeStop example: {"routeKey":"101+1+KENNEDY TOWN+KWUN TONG (YUE MAN SQUARE)","co":"ctb","seq":12}
    return routeStops.map(routeStop => {
      const { routeKey, co, seq } = routeStop;
      const stopLength = routeList[routeKey].stops[co].length;
      let stopA, stopB;
      if(seq == stopLength - 1) { // last stop
        // stopA = stopList[routeList[routeKey].stops[co][seq - 1]];
        // stopB = stopList[routeList[routeKey].stops[co][seq]];
        return -1;
      } else {
        stopA = stopList[routeList[routeKey].stops[co][seq]];
        stopB = stopList[routeList[routeKey].stops[co][seq + 1]];
      }
      return getBearingStops(stopA, stopB);
    }).filter(brng => brng !== -1);
  }

  const routeStops : RouteKey[]= [];
  if(routeId !== undefined) {
    // StopDialog
    let targetRouteStops = routeList[routeId].stops;
    stopKeys.forEach(([co, stopId]) => {
      let seq = targetRouteStops[co].indexOf(stopId);
      if(seq != -1) {
        routeStops.push({
          routeKey : routeId,
          co : co,
          seq : seq
        });
      }
    });
  } else {
    // SwipableStopList (saved stop list)
    stopKeys.forEach(([co, stopId]) => {
      Object.keys(routeList).forEach(routeKey => {
        let seq = routeList[routeKey].stops[co].indexOf(stopId);
        if(seq != -1) {
          routeStops.push({
            routeKey : routeKey,
            co : co,
            seq : seq
          });
        }
      })
    });
  }
  const bearingTargets = findRouteStopBearings(routeStops);
  const isBearingAccepted = (bearing : number) => {
    if(BEARING_THRESHOLD >= 180 || bearingTargets.length == 0) {
      return true;
    } else {
      for(let i = 0; i < bearingTargets.length; ++i) {
        let bearingMin = bearingTargets[i] - BEARING_THRESHOLD;
        let bearingMax = bearingTargets[i] + BEARING_THRESHOLD;
        if(bearingMin < 0)
          bearingMin += 360;
        if(bearingMax > 360)
          bearingMax -= 360;
        if((bearingMin <= bearingMax && bearingMin <= bearing && bearing <= bearingMax)
        || (bearingMin > bearingMax && (bearingMin <= bearing || bearing <= bearingMax))) // crossing 0/360 degress, eg min=340,max=020
          return true;
      }
      return false;
    }
  }
  const findNearbyStops = (targetId : string, excludeList : string[]) => {
    let targetStop = stopList[targetId];

    return Object.keys(stopList).filter((stopId) => {
      // find stops that are within X metres of target stop and along similar direction
      return getDistanceStop(targetStop, stopList[stopId]) <= DISTANCE_THRESHOLD &&
      // filter out stops that have not been added into excludeList before
      !excludeList.includes(stopId);
    })
    .reduce( (acc, stopId) => {
      // get all the routes that has stop with this stopId
      const rs = Object.entries(routeList).map(([routeKey, routeListEntry]) => {
        const stops = routeListEntry.stops ?? {};
        const companies = Object.keys(stops) as Company[];
        for(let co of companies) {
          let stopPos = stops[co].indexOf(stopId);
          if(stopPos > -1)
            return { routeKey : routeKey, co : co, seq : stopPos } as RouteKey;
        }
        return { routeKey : routeKey, co : 'ctb', seq : -1 } as RouteKey; // use ctb as dummy value and seq = -1, will be discarded in next filter
      })
      .filter((obj) => obj.seq != -1);
      // if any of the stops is within acceptable bearing range, add to the list
      const bearings = findRouteStopBearings(rs);
      if(bearings.find(b => isBearingAccepted(b)) !== undefined) {
        const thisStop : StopListEntryExtended = {
          ...stopList[stopId],
          id : stopId,
          distance : 0 // dummy value
        };
        acc.push(thisStop);
      }
      return acc
    }, [] as Array<StopListEntryExtended>);
  }

  const stopGroup = useMemo<Array<[Company, string]>>(() => {
    const stopGroup : Array<[Company, string]> = [];
    let stopListEntries : StopListEntryExtended[] = [];

    stopKeys.forEach((stopKey) => {
      const [co, stopId] = stopKey;
      stopListEntries = stopListEntries.concat(findNearbyStops(stopId, stopListEntries.map((stop) => stop.id)));
      for(let i = 0; i < stopListEntries.length; ++i) {
        stopListEntries = stopListEntries.concat(findNearbyStops(stopListEntries[i].id, stopListEntries.map((stop) => stop.id)));
        if(stopListEntries.length >= MAX_STOPS_LIMIT)
          break;
      }
    });

    // sort by distance from first stop in stopMap (stopKeys[0])
    if(stopKeys.length > 0) {
      let [, stopId] = stopKeys[0];
      stopListEntries = stopListEntries.map(stop => {
        return {
          ... stop,
          distance : getDistanceStop(stopList[stopId], stop)
        };
      }).sort((stopA, stopB) => {
        return stopA.distance - stopB.distance
      });
      stopListEntries.forEach((stopListEntry) => {
        // find co of stop id from routeList
        let found = false;
        for(let [,routeListEntry] of Object.entries(routeList)) {
          const companies = Object.keys(routeListEntry.stops) as Company[];
          for(let co of companies) {
            if(routeListEntry.stops[co]?.includes(stopListEntry.id)) {
              stopGroup.push([co, stopListEntry.id]);
              found = true;
              break;
            }
          }
          if(found) {
            break;
          }
        }
      });
    }
    return stopGroup;
  }, [stopKeys, routeList, stopList, findNearbyStops]);

  return stopGroup;
};
