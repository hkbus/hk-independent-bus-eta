import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchEtas } from "hk-bus-eta";
import AppContext from "../AppContext";

export const useEtas = (routeId) => {
  const {
    db: { routeList },
    isVisible,
    refreshInterval,
  } = useContext(AppContext);
  const [routeKey, seq] = routeId.split("/");
  const routeObj = routeList[routeKey] || DefaultRoute;
  const [etas, setEtas] = useState(null);
  const {
    i18n: { language },
  } = useTranslation();
  const isMounted = useRef<boolean>(false);

  const fetchData = useCallback(() => {
    if (!isVisible || navigator.userAgent === "prerendering") {
      // skip if prerendering
      setEtas(null);
      return new Promise((resolve) => resolve([]));
    }
    return fetchEtas({
      ...routeObj,
      seq: parseInt(seq, 10),
      language,
    }).then((_etas) => {
      if (isMounted.current) setEtas(_etas);
    });
  }, [isVisible, language, routeObj, seq]);

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
  }, [routeId, fetchData, refreshInterval]);

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
