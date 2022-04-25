import React, { useContext, useEffect, useRef } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AppContext from "../AppContext";
import SearchContext from "../SearchContext";
import { useTranslation } from "react-i18next";
import AddressInput from "../components/route-search/AddressInput";
import SearchResult from "../components/route-search/SearchResult";
import SearchMap from "../components/route-search/SearchMap";
import { fetchEtas, Eta } from "hk-bus-eta";
import { setSeoHeader, getDistance, vibrate } from "../utils";

export type SearchResultType = Array<{
  routeId: string;
  on: number;
  off: number;
}>;

const RouteSearch = () => {
  const { t, i18n } = useTranslation();
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

  const worker = useRef(undefined);
  const terminateWorker = () => {
    if (worker.current) {
      worker.current.terminate();
      worker.current = undefined;
    }
  };

  const updateRoutes = (routeResults: SearchResultType[]) => {
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
              co: Object.keys(routeList[routeId].stops),
              language: i18n.language,
            });
      })
    )
      .then((etas) =>
        // filter out non available route
        uniqueRoutes.filter(
          (routeId, idx) =>
            !navigator.onLine ||
            (etas[idx].length &&
              etas[idx].reduce((acc, eta) => {
                return acc || eta.eta;
              }, null))
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
              return routes.map((route, idx) => {
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
            .map((routes): [SearchResultType, number] => [
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
      lang: i18n.language,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

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
          updateRoutes(e.data.value.sort((a, b) => a.length - b.length));
        };
      }
    }

    return () => {
      terminateWorker();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, locations]);

  const handleStartChange = (value) => {
    setLocations({
      ...locations,
      start: value,
    });

    setStatus("waiting");
    setResultIdx({ resultIdx: 0, stopIdx: [0, 0] });
    setResult([]);
  };

  const handleEndChange = (value) => {
    setLocations({
      ...locations,
      end: value,
    });

    if (value) setStatus("waiting");
    setResultIdx({ resultIdx: 0, stopIdx: [0, 0] });
    setResult([]);
  };

  const handleRouteClick = (idx) => {
    vibrate(vibrateDuration);
    setTimeout(() => {
      setResultIdx({ resultIdx: idx, stopIdx: [0, 0] });
    }, 0);
  };

  const handleMarkerClick = (routeId, offset) => {
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
  };

  return (
    <Root className={classes.root} square elevation={0}>
      {!energyMode ? (
        <SearchMap
          start={locations.start ? locations.start.location : geolocation}
          end={locations.end ? locations.end.location : null}
          routes={result[resultIdx.resultIdx]}
          stopIdx={resultIdx.stopIdx}
          onMarkerClick={handleMarkerClick}
        />
      ) : null}
      <div className={classes.inputContainer}>
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
      </div>
      <Box
        className={!energyMode ? classes.resultList : classes.resultListEnergy}
      >
        {!locations.end ? (
          <RouteSearchDetails />
        ) : "waiting|rendering".includes(status) && result.length === 0 ? (
          <CircularProgress size={30} className={classes.routeLoading} />
        ) : "ready|waiting|rendering".includes(status) && result.length ? (
          result.map((routes, resIdx) => (
            <SearchResult
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
    </Root>
  );
};

const RouteSearchDetails = () => {
  const { t } = useTranslation();
  return (
    <div className={classes.description}>
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
    </div>
  );
};

export default RouteSearch;

const PREFIX = "search";

const classes = {
  root: `${PREFIX}-root`,
  inputContainer: `${PREFIX}-input-container`,
  description: `${PREFIX}-description`,
  resultList: `${PREFIX}-result-list`,
  resultListEnergy: `${PREFIX}-result-list-energy`,
  routeLoading: `${PREFIX}-route-loading`,
};

const Root = styled(Paper)(({ theme }) => ({
  [`&.${classes.root}`]: {
    background:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
    height: "calc(100vh - 125px)",
    overflowY: "hidden",
    textAlign: "left",
  },
  ".search-input-container": {
    marginTop: "2%",
    padding: "0% 2%",
  },
  ".search-description": {
    textAlign: "left",
    marginTop: "5%",
    padding: "5%",
  },
  ".search-result-list": {
    overflowY: "scroll",
    height: "calc(100% - 30vh - 76px)",
  },
  ".search-result-list-energy": {
    overflowY: "scroll",
    height: "calc(100% - 76px)",
  },
  ".search-route-loading": {
    margin: "10%",
  },
}));
