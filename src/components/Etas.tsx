import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AppContext from "../AppContext";
export const useEtas = (routeId: string) => {
  const { db, isVisible } = useContext(AppContext);
  const [routeKey, seq] = routeId.split("/");
  const routeObj = db.routeList?.[routeKey] ?? DefaultRoute;
  const [etas, setEtas] = useState(null);
  const {
    i18n: { language },
  } = useTranslation();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isVisible) {
        setEtas(null);
        return [];
      }
      const fetchEtas = await import("hk-bus-eta").then((mod) => mod.fetchEtas);
      const _etas = await fetchEtas({
        ...routeObj,
        seq: parseInt(seq, 10),
        language,
      });
      if (isMounted) {
        setEtas(_etas);
      }
    };

    const fetchEtaInterval = setInterval(() => {
      fetchData();
    }, 30000);

    fetchData();

    return () => {
      isMounted = false;
      clearInterval(fetchEtaInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, isVisible]);

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
