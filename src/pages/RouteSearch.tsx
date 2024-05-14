import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { ChangeCircle as ChangeCircleIcon } from "@mui/icons-material";

import AppContext from "../context/AppContext";
import { useTranslation } from "react-i18next";
import AddressInput, { Address } from "../components/route-search/AddressInput";
import SearchMap from "../components/route-search/SearchMap";
import { fetchEtas, Eta, Company, Location } from "hk-bus-eta";
import { setSeoHeader, getDistance, vibrate } from "../utils";
import { LinearProgress } from "../components/Progress";
import useLanguage from "../hooks/useTranslation";
import SearchResultList from "../components/route-search/SearchResultList";
import DbContext from "../context/DbContext";

export interface SearchRoute {
  routeId: string;
  on: number;
  off: number;
}

interface RouteSearchState {
  locations: {
    start: Address | null;
    end: Address | null;
  };
  status: "ready" | "rendering" | "waiting";
  result: Array<{ routeId: string; on: number; off: number }[]>;
  resultIdx: {
    resultIdx: number;
    stopIdx: number[];
  };
}

const RouteSearch = () => {
  const { t } = useTranslation();
  const language = useLanguage();
  const {
    AppTitle,
    db: { routeList, stopList, holidays, serviceDayMap },
  } = useContext(DbContext);
  const { geolocation, energyMode, vibrateDuration } = useContext(AppContext);

  const [state, setState] = useState<RouteSearchState>(DEFAULT_STATE);
  const { locations, status, result, resultIdx } = state;

  const worker = useRef<Worker | null>(null);
  const terminateWorker = () => {
    if (worker.current) {
      worker.current.terminate();
      worker.current = null;
    }
  };

  const updateRoutes = useCallback(
    (routeResults: Array<SearchRoute[]>, startLocation: Location) => {
      const uniqueRoutes = routeResults
        .reduce(
          (acc, routeArr) =>
            acc.concat(
              ...routeArr.map((r) => [
                `${r.routeId}/${r.on}`,
                `${r.routeId}/${r.off}`,
              ])
            ),
          [] as string[]
        )
        .filter((v, i, s) => s.indexOf(v) === i);

      // check currently available routes by fetching ETA
      Promise.all(
        uniqueRoutes.map((routeIdSeq): Promise<Eta[]> => {
          const [routeId, seq] = routeIdSeq.split("/");
          return !navigator.onLine
            ? new Promise((resolve) => resolve([]))
            : fetchEtas({
                ...routeList[routeId],
                seq: parseInt(seq, 10),
                co: Object.keys(routeList[routeId].stops) as Company[],
                language: language as "en" | "zh",
                stopList,
                serviceDayMap,
                holidays,
              }).then((p) => p.filter((e) => e.eta));
        })
      )
        .then((etas) =>
          // filter out non available route
          uniqueRoutes.filter(
            (_, idx) =>
              !navigator.onLine ||
              (etas[idx].length &&
                etas[idx].reduce((acc, eta) => Boolean(acc || eta.eta), false))
          )
        )
        .then((availableRoutes) => {
          setState((prev) => ({
            ...prev,
            result: [
              ...prev.result,
              // save current available route only
              ...routeResults
                .filter((routes) =>
                  routes.reduce((ret, route) => {
                    return (
                      ret &&
                      (availableRoutes.indexOf(
                        `${route.routeId}/${route.on}`
                      ) !== -1 ||
                        availableRoutes.indexOf(
                          `${route.routeId}/${route.off}`
                        ) !== -1)
                    );
                  }, true)
                )
                // refine nearest start if available
                .map((routes) => {
                  let start = startLocation;
                  return routes.map((route) => {
                    const stops = Object.values(
                      routeList[route.routeId].stops
                    ).sort((a, b) => b.length - a.length)[0];
                    let bestOn = -1;
                    let dist = 100000;
                    for (let i = route.on; i < route.off; ++i) {
                      let _dist = getDistance(
                        stopList[stops[i]].location,
                        start
                      );
                      if (_dist < dist) {
                        bestOn = i;
                        dist = _dist;
                      }
                    }
                    start = stopList[stops[route.off]].location;
                    return {
                      ...route,
                      on: bestOn,
                    };
                  });
                })
                // sort route by number of stops
                .map((routes): [SearchRoute[], number] => [
                  routes,
                  routes.reduce((sum, route) => sum + route.off - route.on, 0),
                ])
                .sort((a, b) => a[1] - b[1])
                .map((v) => v[0]),
            ],
          }));
        });
    },
    [holidays, language, routeList, serviceDayMap, stopList]
  );

  useEffect(() => {
    setSeoHeader({
      title: t("點對點路線搜尋") + " - " + t(AppTitle),
      description: t("route-search-page-description"),
      lang: language,
    });
  }, [language, t, AppTitle]);

  useEffect(() => {
    // update status if status is rendering
    if (status === "rendering") {
      setState((prev) => ({ ...prev, status: "ready" }));
    }
  }, [status, result]);

  useEffect(() => {
    if (status === "waiting" && locations.end) {
      if (window.Worker) {
        terminateWorker();
        const startLocation = locations.start
          ? locations.start.location
          : geolocation.current;
        worker.current = new Worker("/search-worker.js");
        worker.current.postMessage({
          routeList,
          stopList,
          start: startLocation,
          end: locations.end.location,
          maxDepth: 2,
        });
        worker.current.onmessage = (e) => {
          if (e.data.type === "done") {
            terminateWorker();
            // set status to rendering result if result not empty
            setState((prev) => ({
              ...prev,
              status: e.data.count ? "rendering" : "ready",
            }));
            return;
          }
          updateRoutes(
            e.data.value.sort(
              (a: SearchRoute[], b: SearchRoute[]) => a.length - b.length
            ),
            startLocation
          );
        };
      }
    }

    return () => {
      terminateWorker();
    };
  }, [status, locations, geolocation, routeList, stopList, updateRoutes]);

  const handleStartChange = useCallback((address: Address | null) => {
    setState((prev) => ({
      ...prev,
      locations: {
        ...prev.locations,
        start: address,
      },
      status: "waiting",
      resultIdx: {
        resultIdx: 0,
        stopIdx: [0, 0],
      },
      result: [],
    }));
  }, []);

  const handleEndChange = useCallback((address: Address | null) => {
    setState((prev) => ({
      ...prev,
      locations: {
        ...prev.locations,
        end: address,
      },
      status: address ? "waiting" : prev.status,
      resultIdx: {
        resultIdx: 0,
        stopIdx: [0, 0],
      },
      result: [],
    }));
  }, []);

  const handleRouteClick = useCallback(
    (idx: number) => {
      vibrate(vibrateDuration);
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          resultIdx: { resultIdx: idx, stopIdx: [0, 0] },
        }));
      }, 0);
    },
    [vibrateDuration]
  );

  const handleMarkerClick = useCallback(
    (routeId: string, offset: number) => {
      const routeIdx = result[resultIdx.resultIdx]
        .map((route) => route.routeId)
        .indexOf(routeId);
      setState((prev) => {
        const _stopIdx = [...prev.resultIdx.stopIdx];
        _stopIdx[routeIdx] = offset;
        return {
          ...prev,
          resultIdx: {
            ...prev.resultIdx,
            stopIdx: _stopIdx,
          },
        };
      });
    },
    [result, resultIdx]
  );

  const handleReverseClick = useCallback(() => {
    setState((prev => {
        return {
          ...prev,
          locations: {
            start: prev.locations.end,
            end: prev.locations.start
          },
          status: "waiting",
          resultIdx: {
            resultIdx: 0,
            stopIdx: [0, 0],
          },
          result: [],
        };
    }))
  }, [])

  return (
    <Paper sx={rootSx} square elevation={0}>
      {!energyMode ? (
        <SearchMap
          start={
            locations.start ? locations.start.location : geolocation.current
          }
          end={locations.end ? locations.end.location : null}
          routes={result[resultIdx.resultIdx]}
          stopIdx={resultIdx.stopIdx}
          onMarkerClick={handleMarkerClick}
        />
      ) : null}
      <Box sx={inputContainerSx}>
        <Box sx={inputBoxSx}>
          <AddressInput
            value={locations.start}
            placeholder={t("你的位置")}
            onChange={handleStartChange}
            stopList={stopList}
          />
          <AddressInput
            value={locations.end}
            placeholder={t("目的地")}
            onChange={handleEndChange}
            stopList={stopList}
          />
        </Box>
        <Button sx={reverseIconSx} onClick={handleReverseClick}>
          <ChangeCircleIcon />
        </Button>
      </Box>
      <Box sx={!energyMode ? resultListSx : resultListEnergySx}>
        {!locations.end ? (
          <RouteSearchDetails />
        ) : "waiting|rendering".includes(status) && result.length === 0 ? (
          <LinearProgress />
        ) : "ready|waiting|rendering".includes(status) && result.length ? (
          result.map((routes, resIdx) => (
            <SearchResultList
              key={`search-result-${resIdx}`}
              routes={routes}
              idx={resIdx}
              handleRouteClick={handleRouteClick}
              expanded={resIdx === resultIdx.resultIdx}
              stopIdx={
                resIdx === resultIdx.resultIdx ? resultIdx.stopIdx : null
              }
            />
          ))
        ) : (
          <>{t("找不到合適的巴士路線")}</>
        )}
      </Box>
    </Paper>
  );
};

const RouteSearchDetails = () => {
  const { t } = useTranslation();
  return (
    <Box sx={descriptionSx}>
      <Typography variant="h5">{t("Route Search header")}</Typography>
      <Divider />
      <Typography variant="subtitle1">
        {t("Route Search description")}
      </Typography>
      <br />
      <Typography variant="body2">{t("Route Search constraint")}</Typography>
      <Typography variant="body2">1. {t("Route Search caption 1")}</Typography>
      <Typography variant="body2">2. {t("Route Search caption 2")}</Typography>
      <Typography variant="body2">3. {t("Route Search caption 3")}</Typography>
    </Box>
  );
};

export default RouteSearch;

const DEFAULT_STATE: RouteSearchState = {
  locations: {
    start: null,
    end: null,
  },
  status: "ready",
  result: [],
  resultIdx: {
    resultIdx: 0,
    stopIdx: [0, 0],
  },
};

const rootSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
  overflowY: "hidden",
  textAlign: "left",
  width: "100%",
};

const inputContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  marginTop: "2%",
  padding: "0% 2%",
};

const inputBoxSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

const reverseIconSx: SxProps<Theme> = {
  'min-width': '24px'
}

const resultListSx: SxProps<Theme> = {
  overflowY: "scroll",
  height: "calc(100% - 30vh - 76px)",
};

const resultListEnergySx: SxProps<Theme> = {
  overflowY: "scroll",
  height: "calc(100% - 76px)",
};

const descriptionSx: SxProps<Theme> = {
  textAlign: "left",
  marginTop: "5%",
  padding: "5%",
};
