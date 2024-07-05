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
                  const hash1 = `${route}|${bound[co]??""}|${stopId}`;
                  const hash2 = `${route}|${dest.zh}|${stopId}`;
                  const hash3 = `${route}|${seq}|${(fares != null && seq < fares.length - 1 ? fares[seq] : 0)}`;
                  if(!hashTable.includes(hash1) && !hashTable.includes(hash2) && !hashTable.includes(hash3)) {
                    hashTable.push(hash1);
                    hashTable.push(hash2);
                    hashTable.push(hash3);
                    acc.push([routeId, seq]);
                  }
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
        setStopEtas(
          _etas
            .map((e, idx): [string, Eta[]] => [
              routeKeys[idx].join("/"),
              e.filter(({ co, dest }) => {
                if (co !== "mtr") return true;
                return dest.zh === routeList[routeKeys[idx][0]].dest.zh;
              }),
            ])
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
