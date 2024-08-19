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
    return (
      Object.entries(routeList)
        .reduce(
          (acc, [routeId, { stops, freq }]) => {
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
        const tempEtas : [string[], Eta[]][] = []; // [routeKey array, Etas array]
        setStopEtas(
          _etas
            .map((e, idx): [string, Eta[]] => [
              routeKeys[idx].join("/"),
              e.filter(({ co, dest }) => {
                if (co !== "mtr") return true;
                // return dest.zh === routeList[routeKeys[idx][0]].dest.zh; // checking just dest (Lo Wu vs Lok Ma Chau) is not enough
                return routeList[routeKeys[idx][0]].stops[co].map(stopCode => stopList[stopCode]?.name.zh).includes(dest.zh);
                // Note: some trains terinate mid-way along the line (e.g. Some TCL train terminate at Tsing Yi, some EAL trains terminate at Sha Tin/Tai Po Market)
                // Hence we need to check stop list of whole route. This solves Tsing Yi ETA in TCL, but still does not solve North Point ETA at LOHAS Park in TKL (as the stop is not even in route's stopList)
              }),
            ])
            // try to remove duplicate routes
            .reduce((acc, [_routeKey, _etas]) => {
              if(_etas.length == 0) {
                // no eta, add anyway
                acc.push([_routeKey, _etas]);
              } else {
                // append routeKey to temp if same route no by same company
                // otherwise add new record to temp
                const tempEta = tempEtas.find(_tempEta => {
                  try {
                    const tempEtaTimes = _tempEta[1].map(eta => eta.eta).join('|');
                    const thisEtaTimes = _etas.map(eta => eta.eta).join('|');
                    const tempEtaRouteId = _tempEta[0][0].split("/")[0];
                    const thisEtaRouteId = _routeKey.split("/")[0];
                    const tempEtaRouteNo = routeList[tempEtaRouteId].route;
                    const thisEtaRouteNo = routeList[thisEtaRouteId].route;
                    const tempEtaCompanyList = routeList[tempEtaRouteId].co;
                    const thisEtaCompany = _etas[0].co;
                    return tempEtaTimes === thisEtaTimes && tempEtaCompanyList.includes(thisEtaCompany) && tempEtaRouteNo === thisEtaRouteNo;
                  } catch (e) {
                    return false; // just let it die;
                  }
                });
                if(tempEta !== undefined) {
                  tempEta[0].push(_routeKey);
                } else {
                  tempEtas.push([[_routeKey], _etas]);
                }
                // just add to temp first, do not accumulate into acc yet
              }
              return acc;
            }, [] as [string, Eta[]][])
            .concat(
              // among the routes with same Etas and same routeNo, find the best routeKey
              tempEtas.map(([routeKeys, etas]) : [string, Eta[]] => {
                if(routeKeys.length == 1) {
                  // if only one route with this eta list, return it straight away
                  return [routeKeys[0], etas];
                } else {
                  // find the best route using score-based heuristics (the smaller the score, the better)
                  const routeScores = routeKeys.map((routeKey) : [string, number] => {
                    const [_routeId, ] = routeKey.split("/");
                    const _freq = routeList[_routeId]?.freq ?? null;
                    const _fares = routeList[_routeId]?.fares ?? null;
                    const _serviceType = Number(routeList[_routeId]?.serviceType ?? "16");
                    const _bounds = Object.entries(routeList[_routeId]?.bound).map(([, bound]) => bound);
                    const _available = isRouteAvaliable(_routeId, _freq, isTodayHoliday, serviceDayMap);
                    let routeScore = 0;
                    routeScore += (_available ? 0 : 256); // route not available, add 256
                    routeScore += (_freq !== null ? 0 : 128); // no freq table, add 128
                    routeScore += (_fares !== null ? 0 : 128); // no fares table, add 128
                    routeScore += (_bounds.includes("IO") || _bounds.includes("OI") ? 0 : 32); // if bounds is one-way, add 32 - this make the heuristics to prefer circular route
                    routeScore += _serviceType; // add serviceType, normal route have lower serviceType (preferred), while special routes have higher values
                    return [routeKey, routeScore];
                  });
                  // choose the routeKey with lowest score
                  const [bestRouteKey, ] = routeScores.reduce(([bestRouteKey, minScore], [currentRouteKey, currentScore]) => {
                    if(currentScore < minScore) {
                      bestRouteKey = currentRouteKey;
                      minScore = currentScore;
                    }
                    return [bestRouteKey, minScore];
                  }, ["", 999999]);
                  return [bestRouteKey, etas];
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
