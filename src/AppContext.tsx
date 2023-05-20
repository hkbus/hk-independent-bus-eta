import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { iOSRNWebView, iOSTracking, isStrings, vibrate } from "./utils";
import DbContext from "./DbContext";
import type { DatabaseContextValue } from "./DbContext";
import { Workbox } from "workbox-window";
import { produce, freeze, current } from "immer";
import type { Location as GeoLocation } from "hk-bus-eta";
import { ETA_FORMAT_NEXT_TYPES } from "./constants";
import { useTranslation } from "react-i18next";
import CollectionContext, { CollectionContextValue } from "./CollectionContext";

type GeoPermission = "opening" | "granted" | "denied" | "closed" | null;

interface AppState {
  searchRoute: string;
  selectedRoute: string;
  geoPermission: GeoPermission;
  geolocation: GeoLocation;
  /**
   * hot query count
   */
  hotRoute: Record<string, number>;
  /**
   * route search history
   */
  routeSearchHistory: string[];
  /**
   * filter routes by route schedule against time
   */
  isRouteFilter: boolean;
  /**
   * bus sorting order
   */
  busSortOrder: "KMB first" | "CTB-NWFB first";
  /**
   * number pad order
   */
  numPadOrder: "789456123c0b" | "123456789c0b";
  /**
   * time display format
   */
  etaFormat: "exact" | "diff" | "mixed";
  colorMode: "dark" | "light";
  /**
   * energy saving mode
   */
  energyMode: boolean;
  /**
   * vibrate duration
   */
  vibrateDuration: number;
  /**
   * check if window is on active in mobile
   */
  isVisible: boolean;
  /**
   * enable analytics or not
   */
  analytics: boolean;
  /**
   * ETA refresh interval (millisecond)
   */
  refreshInterval: number;
}

interface AppContextValue
  extends AppState,
    DatabaseContextValue,
    CollectionContextValue {
  setSearchRoute: (searchRoute: string) => void;
  updateSearchRouteByButton: (buttonValue: string) => void;
  updateSelectedRoute: (route: string, seq?: string) => void;
  // UX
  updateGeolocation: (geoLocation: GeoLocation) => void;
  addSearchHistory: (routeSearchHistory: string) => void;
  removeSearchHistoryByRouteId: (routeSearchHistoryId: string) => void;
  resetUsageRecord: () => void;
  // settings
  updateGeoPermission: (
    geoPermission: AppState["geoPermission"],
    deniedCallback?: () => void
  ) => void;
  toggleRouteFilter: () => void;
  toggleBusSortOrder: () => void;
  toggleNumPadOrder: () => void;
  toggleEtaFormat: () => void;
  toggleColorMode: () => void;
  toggleEnergyMode: () => void;
  toggleVibrateDuration: () => void;
  toggleAnalytics: () => void; // not
  updateRefreshInterval: (interval: number) => void;
  changeLanguage: (lang: "zh" | "en") => void;
  workbox?: Workbox;
}

interface AppContextProviderProps {
  children: ReactNode;
  workbox?: Workbox;
}

const AppContext = React.createContext<AppContextValue>(null);
const defaultGeolocation: GeoLocation = { lat: 22.302711, lng: 114.177216 };
const isGeoPremission = (input: unknown): input is GeoPermission => {
  return (
    input === "opening" ||
    input === "granted" ||
    input === "denied" ||
    input === null
  );
};

const isGeoLocation = (input: unknown): input is GeoLocation => {
  if (input instanceof Object && input !== null && input !== undefined) {
    if (typeof input["lat"] === "number" && typeof input["lng"] === "number") {
      return true;
    }
  }
  return false;
};

const isBusSortOrder = (input: unknown): input is AppState["busSortOrder"] => {
  return input === "KMB first" || input === "CTB-NWFB first";
};

const isNumPadOrder = (input: unknown): input is AppState["numPadOrder"] => {
  return input === "789456123c0b" || input === "123456789c0b";
};

const isEtaFormat = (input: unknown): input is AppState["etaFormat"] => {
  return input === "exact" || input === "diff" || input === "mixed";
};

const isColorMode = (input: unknown): input is "dark" | "light" => {
  return input === "dark" || input === "light";
};

const isNumberRecord = (input: unknown): input is Record<string, number> => {
  if (input instanceof Object && input !== null && input !== undefined) {
    if (Object.entries(input).some((v) => typeof v !== "number")) {
      return false;
    } else {
      return true;
    }
  }
  return false;
};

export const AppContextProvider = ({
  workbox,
  children,
}: AppContextProviderProps) => {
  const dbContext = useContext(DbContext);
  const collectionContext = useContext(CollectionContext);
  const getInitialState = (): AppState => {
    const devicePreferColorScheme =
      localStorage.getItem("colorMode") ||
      (navigator.userAgent === "prerendering" && "dark") || // set default color theme in prerendering to "dark"
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    const searchRoute = "";
    const geoPermission: unknown = localStorage.getItem("geoPermission");
    const geoLocation: unknown = JSON.parse(
      localStorage.getItem("geolocation")
    );
    const busSortOrder: unknown = localStorage.getItem("busSortOrder");
    const numPadOrder: unknown = localStorage.getItem("numPadOrder");
    const etaFormat: unknown = localStorage.getItem("etaFormat");
    const routeSearchHistory: unknown = JSON.parse(
      localStorage.getItem("routeSearchHistory")
    );
    const hotRoute: unknown = JSON.parse(localStorage.getItem("hotRoute"));

    return {
      searchRoute: searchRoute,
      selectedRoute: "1-1-CHUK-YUEN-ESTATE-STAR-FERRY",
      geoPermission: isGeoPremission(geoPermission) ? geoPermission : null,
      geolocation: isGeoLocation(geoLocation)
        ? geoLocation
        : defaultGeolocation,
      hotRoute: isNumberRecord(hotRoute) ? hotRoute : {},
      isRouteFilter:
        !!JSON.parse(localStorage.getItem("isRouteFilter")) || false,
      busSortOrder: isBusSortOrder(busSortOrder) ? busSortOrder : "KMB first",
      numPadOrder: isNumPadOrder(numPadOrder) ? numPadOrder : "123456789c0b",
      etaFormat: isEtaFormat(etaFormat) ? etaFormat : "diff",
      routeSearchHistory:
        Array.isArray(routeSearchHistory) && isStrings(routeSearchHistory)
          ? routeSearchHistory
          : [],
      colorMode: isColorMode(devicePreferColorScheme)
        ? devicePreferColorScheme
        : "dark",
      energyMode: !!JSON.parse(localStorage.getItem("energyMode")) || false,
      vibrateDuration: JSON.parse(localStorage.getItem("vibrateDuration")) ?? 1,
      isVisible: true,
      analytics:
        iOSRNWebView() && !iOSTracking()
          ? false
          : JSON.parse(localStorage.getItem("analytics")) ?? true,
      refreshInterval:
        JSON.parse(localStorage.getItem("refreshInterval")) ?? 30000,
    };
  };
  const { i18n } = useTranslation();
  type State = AppState;
  const [state, setStateRaw] = useState(getInitialState);
  const { geoPermission } = state;
  const setState = useCallback((updater: (state: State) => void | State) => {
    if (typeof updater === "function") {
      setStateRaw(produce(updater));
    } else {
      setStateRaw(freeze(updater));
    }
  }, []);
  const setSearchRoute = useCallback(
    (searchRoute: string) => {
      setState((state) => {
        state.searchRoute = searchRoute;
      });
    },
    [setState]
  );

  useEffect(() => {
    if (geoPermission === "granted") {
      try {
        const _geoWatcherId = navigator.geolocation.watchPosition(
          ({ coords: { latitude, longitude } }) => {
            updateGeolocation({ lat: latitude, lng: longitude });
          }
        );
        geoWatcherId.current = _geoWatcherId;
      } catch (e) {
        console.error("cannot watch position", e);
      }
    }
    const onVisibilityChange = () => {
      setStateRaw(
        produce((state: State) => {
          state.isVisible = !document.hidden;
        })
      );
    };
    window.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      if (geoWatcherId.current) {
        navigator.geolocation.clearWatch(geoWatcherId.current);
      }
      window.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateGeolocation = useCallback((geolocation: GeoLocation) => {
    setStateRaw(
      produce((state: State) => {
        state.geolocation = geolocation;
        localStorage.setItem("geolocation", JSON.stringify(geolocation));
      })
    );
  }, []);

  const setGeoPermission = useCallback(
    (geoPermission: AppState["geoPermission"]) => {
      setState((state) => {
        state.geoPermission = geoPermission;
      });
    },
    [setState]
  );
  const geoWatcherId = useRef(null);

  const updateGeoPermission = useCallback(
    (geoPermission: AppState["geoPermission"], deniedCallback?: () => void) => {
      if (geoPermission === "opening") {
        setGeoPermission("opening");
        const _geoWatcherId = navigator.geolocation.watchPosition(
          ({ coords: { latitude, longitude } }) => {
            updateGeolocation({ lat: latitude, lng: longitude });
            setGeoPermission("granted");
            localStorage.setItem("geoPermission", "granted");
          },
          () => {
            setGeoPermission("denied");
            localStorage.setItem("geoPermission", "denied");
            if (deniedCallback) deniedCallback();
          }
        );
        geoWatcherId.current = _geoWatcherId;
      } else if (geoWatcherId.current) {
        navigator.geolocation.clearWatch(geoWatcherId.current);
        geoWatcherId.current = null;
        setGeoPermission(geoPermission);
        localStorage.setItem("geoPermission", geoPermission);
      }
    },
    [setGeoPermission, updateGeolocation]
  );

  const toggleRouteFilter = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prev = state.isRouteFilter;
        const isRouteFilter = prev ? false : true;
        localStorage.setItem("isRouteFilter", JSON.stringify(isRouteFilter));
        state.isRouteFilter = isRouteFilter;
      })
    );
  }, []);

  const toggleBusSortOrder = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prevOrder = state.busSortOrder;
        const busSortOrder =
          prevOrder === "KMB first" ? "CTB-NWFB first" : "KMB first";
        localStorage.setItem("busSortOrder", busSortOrder);
        state.busSortOrder = busSortOrder;
      })
    );
  }, []);

  const toggleNumPadOrder = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prevOrder = state.numPadOrder;
        const numPadOrder =
          prevOrder === "123456789c0b" ? "789456123c0b" : "123456789c0b";
        localStorage.setItem("numPadOrder", numPadOrder);
        state.numPadOrder = numPadOrder;
      })
    );
  }, []);

  const toggleEtaFormat = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prev = state.etaFormat;
        const etaFormat = ETA_FORMAT_NEXT_TYPES[prev];
        localStorage.setItem("etaFormat", etaFormat);
        state.etaFormat = etaFormat;
      })
    );
  }, []);

  const toggleColorMode = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prevColorMode = state.colorMode;
        const colorMode = prevColorMode === "dark" ? "light" : "dark";
        localStorage.setItem("colorMode", colorMode);
        state.colorMode = colorMode;
      })
    );
  }, []);

  const toggleEnergyMode = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prevEnergyMode = state.energyMode;
        const energyMode = !prevEnergyMode;
        localStorage.setItem("energyMode", JSON.stringify(energyMode));
        state.energyMode = energyMode;
      })
    );
  }, []);

  const toggleAnalytics = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prev = state.analytics;
        const analytics = !prev;
        localStorage.setItem("analytics", JSON.stringify(analytics));
        state.analytics = analytics;
      })
    );
  }, []);

  const updateRefreshInterval = useCallback((refreshInterval: number) => {
    setStateRaw(
      produce((state: State) => {
        localStorage.setItem(
          "refreshInterval",
          JSON.stringify(refreshInterval)
        );
        state.refreshInterval = refreshInterval;
      })
    );
  }, []);

  const toggleVibrateDuration = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prevVibrateDuration = state.vibrateDuration;
        const vibrateDuration = prevVibrateDuration ? 0 : 1;
        localStorage.setItem(
          "vibrateDuration",
          JSON.stringify(vibrateDuration)
        );
        state.vibrateDuration = vibrateDuration;
      })
    );
  }, []);

  const updateSearchRouteByButton = useCallback(
    (buttonValue: string) => {
      vibrate(state.vibrateDuration);
      setTimeout(() => {
        setStateRaw(
          produce((state: State) => {
            const prevSearchRoute = state.searchRoute;
            let ret;
            switch (buttonValue) {
              case "b":
                ret = prevSearchRoute.slice(0, -1);
                break;
              case "c":
                ret = "";
                break;
              default:
                ret = prevSearchRoute + buttonValue;
            }
            state.searchRoute = ret;
          })
        );
      }, 0);
    },
    [state.vibrateDuration]
  );

  const updateSelectedRoute = useCallback((route: string, seq: string = "") => {
    setStateRaw(
      produce((state: State) => {
        state.selectedRoute = `${route}/${seq}`;
        if (seq) {
          if (state.hotRoute[route + "/" + seq]) {
            state.hotRoute[route + "/" + seq] =
              state.hotRoute[route + "/" + seq] + 1;
          } else {
            state.hotRoute[route + "/" + seq] = 1;
          }
          localStorage.setItem(
            "hotRoute",
            JSON.stringify(current(state.hotRoute))
          );
        }
      })
    );
  }, []);

  const addSearchHistory = useCallback((route) => {
    setStateRaw(
      produce((state: State) => {
        const newSearchHistory = [route, ...state.routeSearchHistory]
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .slice(0, 20);
        localStorage.setItem(
          "routeSearchHistory",
          JSON.stringify(newSearchHistory)
        );
        state.routeSearchHistory = newSearchHistory;
      })
    );
  }, []);

  const removeSearchHistoryByRouteId = useCallback((routeId) => {
    setStateRaw(
      produce((state: State) => {
        const newSearchHistory = state.routeSearchHistory.filter(
          (item) => item !== routeId
        );
        localStorage.setItem(
          "routeSearchHistory",
          JSON.stringify(newSearchHistory)
        );
        state.routeSearchHistory = newSearchHistory;
      })
    );
  }, []);

  const resetUsageRecord = useCallback(() => {
    localStorage.clear();
    setStateRaw(
      produce((state: State) => {
        state.hotRoute = {};
        state.geolocation = defaultGeolocation;
      })
    );
  }, []);

  const changeLanguage = useCallback(
    (lang: "zh" | "en") => {
      i18n.changeLanguage(lang);
      localStorage.setItem("lang", lang);
    },
    [i18n]
  );

  const contextValue = useMemo(() => {
    return {
      ...dbContext,
      ...collectionContext,
      ...state,
      setSearchRoute,
      updateSearchRouteByButton,
      updateSelectedRoute,
      updateGeolocation,
      addSearchHistory,
      removeSearchHistoryByRouteId,
      resetUsageRecord,
      updateGeoPermission,
      toggleRouteFilter,
      toggleBusSortOrder,
      toggleNumPadOrder,
      toggleEtaFormat,
      toggleColorMode,
      toggleEnergyMode,
      toggleVibrateDuration,
      toggleAnalytics,
      updateRefreshInterval,
      changeLanguage,
      workbox,
    };
  }, [
    dbContext,
    collectionContext,
    state,
    setSearchRoute,
    updateSearchRouteByButton,
    updateSelectedRoute,
    updateGeolocation,
    addSearchHistory,
    removeSearchHistoryByRouteId,
    resetUsageRecord,
    updateGeoPermission,
    toggleRouteFilter,
    toggleBusSortOrder,
    toggleNumPadOrder,
    toggleEtaFormat,
    toggleColorMode,
    toggleEnergyMode,
    toggleVibrateDuration,
    toggleAnalytics,
    updateRefreshInterval,
    changeLanguage,
    workbox,
  ]);
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;
export type { AppContextValue };
