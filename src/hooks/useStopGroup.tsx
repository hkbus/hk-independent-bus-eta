import { useContext,  useMemo } from "react";
import { Company } from "hk-bus-eta";
import type { StopListEntry } from "hk-bus-eta";
import DbContext from "../context/DbContext";
import { getDistance, getBearing } from "../utils";

interface useStopGroupProps {
  stopKeys: Array<[Company, string]>;
  routeId : string | undefined;
}
interface StopListEntryExtended extends StopListEntry {
  id : string;
  distance : number;
  routeStops : RouteStopCoSeq[];
}
interface RouteStopCoSeq {
  routeKey : string;
  co : Company;
  seq : number;
}

// stopKey in format "<co>|<stopId>", e.g., "lightRail|LR140"
export const useStopGroup = ({
  stopKeys, routeId
}: useStopGroupProps) => {
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);

  // TODO: put these constants in AppContext user preference
  const DISTANCE_THRESHOLD = 50; // in metres, will recursively find stops within this number of metres, so keep it as small as possible. Never choose larger than 300m.
  const BEARING_THRESHOLD = 45; // in degrees (°), acceptable deviation to the left or right of current bearing
  const STOP_LIST_LIMIT = 50; // max number of stops in a group, if more than that, the ETA list will be too long and meaningless

  const getDistanceStop = (a : StopListEntry, b : StopListEntry) => {
    return getDistance(a.location, b.location);
  };
  const getBearingStops = (a : StopListEntry, b : StopListEntry) => {
    return getBearing(a.location, b.location);
  };
 
  const getAllRouteStopsBearings = (routeStops : RouteStopCoSeq[]) => {
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

  const routeStops : RouteStopCoSeq[]= [];
  if(routeId !== undefined) {
    // StopDialog
    let targetRouteStops = routeList[routeId].stops;
    stopKeys.forEach(([co, stopId]) => {
      let seq = targetRouteStops[co]?.indexOf(stopId) ?? -1;
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
        let seq = routeList[routeKey]?.stops[co]?.indexOf(stopId) ?? -1;
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
  const bearingTargets = getAllRouteStopsBearings(routeStops);
  const isBearingInRange = (bearing : number) => {
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
        || (bearingMin > bearingMax && (bearingMin <= bearing || bearing <= bearingMax))) // crossing 0/360° mark, eg min=340°,max=020°
          return true;
      }
      return false;
    }
  }

  const stopGroup = useMemo<Array<[Company, string]>>(() => {
    let stopListEntries : StopListEntryExtended[] = [];
    const searchNearbyStops = (targetStopId : string, excludedStopIdList : string[]) => {
      const targetStop = stopList[targetStopId];

      return Object.keys(stopList).filter((stopId) => {
        // find stops that are within DISTANCE_THRESHOLD metres of target stop and along similar direction
        return getDistanceStop(targetStop, stopList[stopId]) <= DISTANCE_THRESHOLD &&
        // filter out stops that have not been added into excludeList before
        !excludedStopIdList.includes(stopId);
      })
      .reduce( (acc, stopId) => {
        // get all the routes that has stop with this stopId
        const _routeStops = Object.entries(routeList).map(([routeKey, routeListEntry]) => {
          const stops = routeListEntry.stops ?? {};
          const companies = Object.keys(stops) as Company[];
          for(let co of companies) {
            let stopPos = stops[co]?.indexOf(stopId) ?? -1;
            if(stopPos > -1)
              return { routeKey : routeKey, co : co, seq : stopPos } as RouteStopCoSeq;
          }
          return { routeKey : routeKey, co : 'ctb', seq : -1 } as RouteStopCoSeq; // use ctb as dummy value and seq = -1, will be discarded in next filter
        })
        .filter((_rs) => _rs.seq != -1);
        // if any of the routes passing this stop is facing same direction (+/- BEARING_THRESHOLD), add the stop to the list
        // Note: once the stop is added, other routes not facing same direction but passing this stop will also be shown in ETA (most commonly seen in railway lines)
        const bearings = getAllRouteStopsBearings(_routeStops);
        if(bearings.find(b => isBearingInRange(b)) !== undefined) {
          const thisStop : StopListEntryExtended = {
            ...stopList[stopId],
            id : stopId,
            routeStops : _routeStops, // _routeStops.length must be > 0 here, as bearings.length must be > 0 to reach into this if-condition
            distance : 0 // dummy value
          };
          acc.push(thisStop);
        }
        return acc
      }, [] as Array<StopListEntryExtended>);
    }

    // recursively search for nearby stops within thresholds (distance and bearing)
    // stop searching when no new stops are found within range, or when stop list is getting too large
    stopKeys.forEach((stopKey) => {
      const [, stopId] = stopKey; // [co, stopId]
      stopListEntries = stopListEntries.concat(searchNearbyStops(stopId, stopListEntries.map((stop) => stop.id)));
      for(let i = 0; i < stopListEntries.length; ++i) { // use traditional for-loop as the length keeps expanding
        stopListEntries = stopListEntries.concat(searchNearbyStops(stopListEntries[i].id, stopListEntries.map((stop) => stop.id)));
        if(stopListEntries.length >= STOP_LIST_LIMIT)
          break;
      }
    });

    // sort by distance from first stop in stopMap (stopKeys[0])
    const _stopGroup : Array<[Company, string]> = [];
    if(stopKeys.length > 0) {
      let [, stopId] = stopKeys[0]; // [co, stopId] but don't use this co
      stopListEntries = stopListEntries.map(stop => {
        return {
          ... stop,
          distance : getDistanceStop(stopList[stopId], stop)
        };
      }).sort((stopA, stopB) => {
        return stopA.distance - stopB.distance
      });
      stopListEntries.forEach((stopListEntry) => {
        if(stopListEntry.routeStops.length > 0)
          _stopGroup.push([stopListEntry.routeStops[0].co, stopListEntry.id]);
        // // find co of stop id from routeList
        // let found = false;
        // for(let [,routeListEntry] of Object.entries(routeList)) {
        //   const companies = Object.keys(routeListEntry.stops) as Company[];
        //   for(let co of companies) {
        //     if(routeListEntry.stops[co]?.includes(stopListEntry.id)) {
        //       _stopGroup.push([co, stopListEntry.id]);
        //       found = true;
        //       break;
        //     }
        //   }
        //   if(found) {
        //     break;
        //   }
        // }
      });
    }
    return _stopGroup;
  }, [stopKeys, routeList, stopList]);

  return stopGroup;
};
