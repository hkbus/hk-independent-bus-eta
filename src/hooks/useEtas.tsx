import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Eta, fetchEtas } from "hk-bus-eta";
import AppContext from "../context/AppContext";
import useLanguage from "./useTranslation";
import DbContext from "../context/DbContext";

export const useEtas = (routeId: string, disable: boolean = false) => {
  const { isVisible, refreshInterval } = useContext(AppContext);
  const {
    db: { routeList, stopList, holidays, serviceDayMap },
  } = useContext(DbContext);
  const [routeKey, seq] = routeId.split("/");
  const routeObj = routeList[routeKey] || DefaultRoute;
  const [etas, setEtas] = useState<Eta[] | null>(null);
  const language = useLanguage();
  const runId = useRef<number>(0);

  const fetchData = useCallback(() => {
    const id = runId.current;
    if (!isVisible || navigator.userAgent === "prerendering") {
      // skip if prerendering
      setEtas(null);
      return new Promise((resolve) => resolve([]));
    }
    return fetchEtas({
      ...routeObj,
      seq: parseInt(seq, 10),
      stopList,
      language,
      holidays,
      serviceDayMap,
    }).then((_etas) => {
      if (id === runId.current) setEtas(_etas);
    });
  }, [isVisible, language, routeObj, seq, stopList, holidays, serviceDayMap]);

  useEffect(() => {
    if (disable) return;
    const fetchEtaInterval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    fetchData();

    return () => {
      runId.current += 1;
      clearInterval(fetchEtaInterval);
    };
  }, [routeId, fetchData, refreshInterval, disable]);

  return etas;
};

const DefaultRoute = {
  co: [""],
  stops: { "": [""] },
  dest: { zh: "", en: "" },
  bound: "",
  nlbId: 0,
  gtfsId: "",
  fares: [],
  faresHoliday: [],
};
