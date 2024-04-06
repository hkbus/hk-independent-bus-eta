import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Eta, fetchEtas } from "hk-bus-eta";
import AppContext from "../AppContext";
import useLanguage from "./useTranslation";

export const useEtas = (routeId: string, disable: boolean = false) => {
  const {
    db: { routeList, stopList },
    isVisible,
    refreshInterval,
  } = useContext(AppContext);
  const [routeKey, seq] = routeId.split("/");
  const routeObj = routeList[routeKey] || DefaultRoute;
  const [etas, setEtas] = useState<Eta[] | null>(null);
  const language = useLanguage();
  const isMounted = useRef<boolean>(false);

  const fetchData = useCallback(() => {
    if (!isVisible || navigator.userAgent === "prerendering") {
      // skip if prerendering
      setEtas(null);
      return new Promise((resolve) => resolve([]));
    }
    if (
      routeObj.co.includes("hkkf") ||
      routeObj.co.includes("fortuneferry") ||
      routeObj.co.includes("sunferry")
    ) {
      setEtas([]);
      return Promise.resolve([]);
    }
    return fetchEtas({
      ...routeObj,
      seq: parseInt(seq, 10),
      stopList,
      // @ts-ignore
      language,
    }).then((_etas) => {
      if (isMounted.current) setEtas(_etas);
    });
  }, [isVisible, language, routeObj, seq, stopList]);

  useEffect(() => {
    if (disable) return;
    isMounted.current = true;
    const fetchEtaInterval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    fetchData();

    return () => {
      isMounted.current = false;
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
