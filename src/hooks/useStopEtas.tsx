import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Eta, fetchEtas } from "hk-bus-eta";
import AppContext from "../AppContext";
import { isHoliday, isRouteAvaliable } from "../timetable";

// stopKey in format "<co>|<stopId>", e.g., "lightRail|LR140"
export const useStopEtas = (stopKeys: string[][]) => {
  const {
    db: { holidays, routeList },
    isVisible,
    refreshInterval,
    isRouteFilter,
  } = useContext(AppContext);

  const isTodayHoliday = useCallback(
    (today: Date) => isHoliday(holidays, today),
    [holidays]
  );

  const isLightRail = useMemo(
    () => stopKeys.reduce((acc, [co]) => co === "lightRail", false),
    [stopKeys]
  );

  const routeKeys = useMemo(() => {
    return Object.entries(routeList).reduce(
      (acc, [routeId, { stops, freq }]) => {
        if (
          isRouteFilter &&
          !isRouteAvaliable(routeId, freq, isTodayHoliday(new Date()))
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
      []
    );
  }, [stopKeys, routeList, isRouteFilter, isTodayHoliday]);

  const [stopEtas, setStopEtas] = useState<Array<[string, Eta[]]>>([]);
  const {
    i18n: { language },
  } = useTranslation();
  const isMounted = useRef<boolean>(false);

  const fetchData = useCallback(() => {
    if (!isVisible || navigator.userAgent === "prerendering") {
      // skip if prerendering
      setStopEtas([]);
      return new Promise((resolve) => resolve([]));
    }
    return Promise.all(
      routeKeys.map(([id, seq]) =>
        fetchEtas({
          ...routeList[id],
          seq: parseInt(seq, 10),
          // @ts-ignore
          language,
        })
      )
    ).then((_etas) => {
      if (isMounted.current) {
        setStopEtas(
          _etas
            .map((e, idx) => [routeKeys[idx].join("/"), e])
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
  }, [isVisible, language, routeList, routeKeys, isLightRail]);

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
