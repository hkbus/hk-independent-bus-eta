import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Company, Eta, fetchEtas } from "hk-bus-eta";
import AppContext from "../context/AppContext";
import { isRouteAvaliable } from "../timetable";
import useLanguage from "./useTranslation";
import DbContext from "../context/DbContext";

interface useStopEtasProps {
  stopKeys: Array<[Company, string]>;
  disabled?: boolean;
}

// stopKey in format "<co>|<stopId>", e.g., "lightRail|LR140"
export const useStopEtas = ({
  stopKeys,
  disabled = false,
}: useStopEtasProps) => {
  const {
    db: { routeList, stopList, serviceDayMap, holidays },
    isTodayHoliday,
  } = useContext(DbContext);
  const { isVisible, refreshInterval, isRouteFilter } = useContext(AppContext);

  const isLightRail = useMemo(
    () => stopKeys.reduce((acc, [co]) => acc || co === "lightRail", false),
    [stopKeys]
  );

  const routeKeys = useMemo(() => {
    const hashTable : Array<string> = [];
    return (
      Object.entries(routeList)
        .reduce(
          (acc, [routeId, { route, dest, bound, stops, freq, fares }]) => {
            if (
              isRouteFilter &&
              !isRouteAvaliable(routeId, freq, isTodayHoliday, serviceDayMap)
            ) {
              return acc;
            }
            stopKeys.forEach(([co, stopId]) => {
              stops[co]?.forEach((_stopId, seq) => {
                if (_stopId === stopId) {
                  acc.push([routeId, seq]);
                }
              });
            });
            return acc;
          },
          [] as Array<[string, number]>
        )
        // uniquify routeKeys
        .map((v) => v.join("|"))
        .filter((value, idx, self) => self.indexOf(value) === idx)
        .map((v) => v.split("|"))
    );
  }, [stopKeys, routeList, isRouteFilter, isTodayHoliday, serviceDayMap]);

  const [stopEtas, setStopEtas] = useState<Array<[string, Eta[]]>>([]);
  const language = useLanguage();
  const isMounted = useRef<boolean>(false);

  const fetchData = useCallback(() => {
    if (!isVisible || disabled || navigator.userAgent === "prerendering") {
      // skip if prerendering
      setStopEtas([]);
      return new Promise((resolve) => resolve([]));
    }
    return Promise.all(
      routeKeys.map(([id, seq]) =>
        fetchEtas({
          ...routeList[id],
          seq: parseInt(seq, 10),
          stopList,
          language,
          holidays,
          serviceDayMap,
        })
      )
    ).then((_etas) => {
      if (isMounted.current) {
        const tempEtas : [string, string[], Eta[]][] = []; // [Etas (as combined string), routeKey, Etas (as array)]
        setStopEtas(
          _etas
            .map((e, idx): [string, Eta[]] => [
              routeKeys[idx].join("/"),
              e.filter(({ co, dest }) => {
                if (co !== "mtr") return true;
                //return dest.zh === routeList[routeKeys[idx][0]].dest.zh; // checking just dest is not enough
                return routeList[routeKeys[idx][0]].stops[co].map(stopCode => stopList[stopCode]?.name.zh).includes(dest.zh);
              }),
            ])
            // try to remove duplicate routes
            .reduce((agg, [_routeKey, _etas]) => {
              if(_etas.length == 0) {
                // no eta, add anyway
                agg.push([_routeKey, _etas]);
              } else {
                // add to temp
                const _etaStr = _etas.map(eta => eta.eta).join('|');
                const tempEta = tempEtas.find(_eta => _eta[0] === _etaStr);
                if(tempEta !== undefined) {
                  tempEta[1].push(_routeKey);
                } else {
                  tempEtas.push([_etaStr, [_routeKey], _etas]);
                }
                // do not aggregate it yet
              }
              return agg;
            }, [] as [string, Eta[]][])
            .concat(
              tempEtas.map(([, routeKeys, etas]) : [string, Eta[]] => {
                if(routeKeys.length == 1) {
                  // if only one route with this eta list, return it straight away
                  return [routeKeys[0], etas];
                } else {
                  // find the best route
                  // routeProperties = [routeKey, routeId, isRouteAvailable, serviceType]
                  const routeProperties = routeKeys.map((routeKey) : [string, string, boolean, number] => {
                    const [routeId, ] = routeKey.split("/");
                    return [routeKey, routeId, isRouteAvaliable(routeId, routeList[routeId]?.freq ?? null, isTodayHoliday, serviceDayMap), Number(routeList[routeId]?.serviceType ?? "999999")];
                  })
                  const availableRoutes = routeProperties.filter(([,,isAvailable]) => isAvailable);
                  if(availableRoutes.length == 1) {
                    // only one route is available right now
                    return [availableRoutes[0][0], etas];
                  } else if(availableRoutes.length > 1) {
                    // multiple routes are available
                    const sortedRoutes = availableRoutes.sort(([,,,serviceTypeA], [,,,serviceTypeB]) => serviceTypeA - serviceTypeB);
                    return [sortedRoutes[0][0], etas];
                  } else {
                    // no route is currently available according to timetable
                    // find a normal route and display it
                    const normalRoutes = routeProperties.filter(([,,,serviceType]) => serviceType === 1);
                    if(normalRoutes.length > 0) {
                      return [normalRoutes[0][0], etas];
                    }
                    return [routeKeys[0], etas]; // fallback case: use the first route
                  }
                }
              })
            )
            // sort to display the earliest arrival transport first
            .sort(([keyA, a], [keyB, b]) => {
              if (a.length === 0) return 1;
              if (b.length === 0) return -1;
              if (isLightRail) {
                if (a[0].remark.zh === b[0].remark.zh) {
                  return a[0].eta < b[0].eta ? -1 : 1;
                }
                return a[0].remark.zh < b[0].remark.zh ? -1 : 1;
              }
              if (a[0].eta === b[0].eta) {
                return keyA < keyB ? -1 : 1;
              }
              return a[0].eta < b[0].eta ? -1 : 1;
            }) as Array<[string, Eta[]]>
        );
      }
    });
  }, [
    isVisible,
    disabled,
    language,
    routeList,
    stopList,
    routeKeys,
    isLightRail,
    holidays,
    isTodayHoliday,
    serviceDayMap,
  ]);

  useEffect(() => {
    isMounted.current = true;
    const fetchEtaInterval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    fetchData();

    return () => {
      isMounted.current = false;
      clearInterval(fetchEtaInterval);
    };
  }, [fetchData, refreshInterval]);

  return stopEtas;
};
