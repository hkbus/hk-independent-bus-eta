import { useCallback, useContext, useEffect, useRef } from "react";
import { Box, Divider, Paper, SxProps, Theme, Typography } from "@mui/material";
import AppContext from "../AppContext";
import SearchContext from "../SearchContext";
import { useTranslation } from "react-i18next";
import AddressInput, { Address } from "../components/route-search/AddressInput";
import SearchResult from "../components/route-search/SearchResultList";
import SearchMap from "../components/route-search/SearchMap";
import { fetchEtas, Eta } from "hk-bus-eta";
import { setSeoHeader, getDistance, vibrate } from "../utils";
import { LinearProgress } from "../components/Progress";
import useLanguage from "../hooks/useTranslation";
import SearchResultList from "../components/route-search/SearchResultList";

export interface SearchRoute {
  routeId: string;
  on: number;
  off: number;
}

export type SearchResult = SearchRoute[]

const RouteSearch = () => {
  const { t } = useTranslation();
  const language = useLanguage();
  const {
    AppTitle,
    geolocation,
    energyMode,
    db: { routeList, stopList },
    vibrateDuration,
  } = useContext(AppContext);
  const {
    locations,
    setLocations,
    status,
    setStatus,
    result,
    setResult,
    resultIdx,
    setResultIdx,
  } = useContext(SearchContext);

  const worker = useRef<Worker | null>(null);
  const terminateWorker = () => {
    if (worker.current) {
      worker.current.terminate();
      worker.current = null;
    }
  };

  const updateRoutes = (routeResults: Array<SearchResult>) => {
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
              routeStops: routeList[routeId].stops,
              // @ts-ignore
              co: Object.keys(routeList[routeId].stops),
              // @ts-ignore
              language: language,
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
        setResult((prevResult) => [
          ...prevResult,
          // save current available route only
          ...routeResults
            .filter((routes) =>
              routes.reduce((ret, route) => {
                return (
                  ret &&
                  (availableRoutes.indexOf(`${route.routeId}/${route.on}`) !==
                    -1 ||
                    availableRoutes.indexOf(`${route.routeId}/${route.off}`) !==
                      -1)
                );
              }, true)
            )
            // refine nearest start if available
            .map((routes) => {
              let start = locations.start
                ? locations.start.location
                : geolocation;
              return routes.map((route) => {
                const stops = Object.values(
                  routeList[route.routeId].stops
                ).sort((a, b) => b.length - a.length)[0];
                let bestOn = -1;
                let dist = 100000;
                for (var i = route.on; i < route.off; ++i) {
                  let _dist = getDistance(stopList[stops[i]].location, start);
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
            .map((routes): [SearchResult, number] => [
              routes,
              routes.reduce((sum, route) => sum + route.off - route.on, 0),
            ])
            .sort((a, b) => a[1] - b[1])
            .map((v) => v[0]),
        ]);
      });
  };

  useEffect(() => {
    setSeoHeader({
      title: t("點對點路線搜尋") + " - " + t(AppTitle),
      description: t("route-search-page-description"),
      lang: language,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    // update status if status is rendering
    if (status === "rendering") {
      setStatus("ready");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (status === "waiting" && locations.end) {
      if (window.Worker) {
        terminateWorker();
        worker.current = new Worker("/search-worker.js");
        worker.current.postMessage({
          routeList,
          stopList,
          start: locations.start ? locations.start.location : geolocation,
          end: locations.end.location,
          maxDepth: 2,
        });
        worker.current.onmessage = (e) => {
          if (e.data.type === "done") {
            terminateWorker();
            // set status to rendering result if result not empty
            setStatus(e.data.count ? "rendering" : "ready");
            return;
          }
          updateRoutes(e.data.value.sort((a: SearchResult, b: SearchResult) => a.length - b.length));
        };
      }
    }

    return () => {
      terminateWorker();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, locations]);

  const handleStartChange = useCallback((address: Address | null) => {
    setLocations({
      ...locations,
      start: address,
    });

    setStatus("waiting");
    setResultIdx({ resultIdx: 0, stopIdx: [0, 0] });
    setResult([]);
  }, [setLocations, setStatus, setResultIdx, setResult]);

  const handleEndChange = useCallback((address: Address | null) => {
    setLocations({
      ...locations,
      end: address,
    });

    if (address) setStatus("waiting");
    setResultIdx({ resultIdx: 0, stopIdx: [0, 0] });
    setResult([]);
  }, [setLocations, setStatus, setResultIdx, setResult]);

  const handleRouteClick = useCallback( (idx: number) => {
    vibrate(vibrateDuration);
    setTimeout(() => {
      setResultIdx({ resultIdx: idx, stopIdx: [0, 0] });
    }, 0);
  }, [vibrate, vibrateDuration, setResultIdx]);

  const handleMarkerClick = useCallback((routeId: string, offset: number) => {
    console.log(routeId)
    const routeIdx = result[resultIdx.resultIdx]
      .map((route) => route.routeId)
      .indexOf(routeId);
    setResultIdx((prevResultIdx) => {
      const _stopIdx = [...prevResultIdx.stopIdx];
      _stopIdx[routeIdx] = offset;
      return {
        ...prevResultIdx,
        stopIdx: _stopIdx,
      };
    });
  }, [result, resultIdx, setResultIdx]);

  return (
    <Paper sx={rootSx} square elevation={0}>
      {!energyMode ? (
        <SearchMap
          start={locations.start ? locations.start.location : geolocation}
          end={locations.end ? locations.end.location : null}
          routes={result[resultIdx.resultIdx]}
          stopIdx={resultIdx.stopIdx}
          onMarkerClick={handleMarkerClick}
        />
      ) : null}
      <Box sx={inputContainerSx}>
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

const rootSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
  overflowY: "hidden",
  textAlign: "left",
  width: "100%",
};

const inputContainerSx: SxProps<Theme> = {
  marginTop: "2%",
  padding: "0% 2%",
};

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
