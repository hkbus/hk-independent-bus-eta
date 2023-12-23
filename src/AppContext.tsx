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
import { produce, freeze } from "immer";
import type { Location as GeoLocation } from "hk-bus-eta";
import { ETA_FORMAT_NEXT_TYPES } from "./constants";
import { useTranslation } from "react-i18next";
import CollectionContext, { CollectionContextValue } from "./CollectionContext";
import {
  BusSortOrder,
  ColorMode,
  EtaFormat,
  Language,
  NumPadOrder,
} from "./data";
import { DeviceOrientationPermission } from "react-world-compass";
import { searchRangeOptions } from "./components/home/SwipeableList";

type GeoPermission = "opening" | "granted" | "denied" | "closed" | null;

export interface AppState {
  searchRoute: string;
  selectedRoute: string;
  geoPermission: GeoPermission;
  geolocation: GeoLocation;
  /**
   * location set by user
   */
  manualGeolocation: GeoLocation;
  /**
   * manual location mode on by user
   */
  isManualGeolocation: boolean;
  compassPermission: DeviceOrientationPermission;
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
  busSortOrder: BusSortOrder;
  /**
   * number pad order
   */
  numPadOrder: NumPadOrder;
  /**
   * time display format
   */
  etaFormat: EtaFormat;
  _colorMode: ColorMode;
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
  /**
   * Annotate scheduled bus
   */
  annotateScheduled: boolean;
  /**
   * Show recently searched
   */
  isRecentSearchShown: boolean;
  /**
   * Font size
   */
  fontSize: number;
  /**
   * Range for geolocation search
   */
  lastSearchRange: number;
  /**
   * Custom Range for geolocation search
   */
  customSearchRange: number;
}

interface AppContextValue
  extends AppState,
    DatabaseContextValue,
    CollectionContextValue {
  colorMode: "light" | "dark";
  setSearchRoute: (searchRoute: string) => void;
  updateSearchRouteByButton: (buttonValue: string) => void;
  updateSelectedRoute: (route: string, seq?: string) => void;
  // UX
  setCompassPermission: (permission: DeviceOrientationPermission) => void;
  updateGeolocation: (geoLocation: GeoLocation) => void;
  setManualGeolocation: (geoLocation: GeoLocation) => void;
  setIsManualGeolocation: (isManualGeolocation: boolean) => void;
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
  toggleAnnotateScheduled: () => void;
  toggleIsRecentSearchShown: () => void;
  changeLanguage: (lang: Language) => void;
  setFontSize: (fontSize: number) => void;
  importAppState: (appState: AppState) => void;
  workbox?: Workbox;
  lastSearchRange: number;
  setLastSearchRange: (lastSearchRange: number) => void;
  customSearchRange: number;
  setCustomSearchRange: (customSearchRange: number) => void;

  // for React Native Context
  setGeoPermission: (geoPermission: AppState["geoPermission"]) => void;
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

const isCompassPermission = (
  input: unknown
): input is DeviceOrientationPermission => {
  return input === "granted" || input === "denied" || input === "default";
};

export const isBusSortOrder = (input: unknown): input is BusSortOrder => {
  return input === "KMB first" || input === "CTB first";
};

const isNumPadOrder = (input: unknown): input is NumPadOrder => {
  return input === "789456123c0b" || input === "123456789c0b";
};

const isEtaFormat = (input: unknown): input is EtaFormat => {
  return input === "exact" || input === "diff" || input === "mixed";
};

const isColorMode = (input: unknown): input is ColorMode => {
  return input === "dark" || input === "light" || input === "system";
};

// use the largest search range option as default
export const defaultSearchRange =
  searchRangeOptions[searchRangeOptions.length - 1];

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
      "system";
    const searchRoute = "";
    const geoPermission: unknown = localStorage.getItem("geoPermission");
    const geoLocation: unknown = JSON.parse(
      localStorage.getItem("geolocation")
    );
    const compassPermission: unknown =
      localStorage.getItem("compassPermission");
    const busSortOrder: unknown = localStorage.getItem("busSortOrder");
    const numPadOrder: unknown = localStorage.getItem("numPadOrder");
    const etaFormat: unknown = localStorage.getItem("etaFormat");
    const routeSearchHistory: unknown = JSON.parse(
      localStorage.getItem("routeSearchHistory")
    );

    return {
      searchRoute: searchRoute,
      selectedRoute: "1-1-CHUK-YUEN-ESTATE-STAR-FERRY",
      geoPermission: isGeoPremission(geoPermission) ? geoPermission : null,
      geolocation: isGeoLocation(geoLocation)
        ? geoLocation
        : defaultGeolocation,
      manualGeolocation:
        JSON.parse(localStorage.getItem("manualGeolocation")) ||
        isGeoLocation(geoLocation)
          ? (geoLocation as GeoLocation)
          : defaultGeolocation,
      isManualGeolocation:
        JSON.parse(localStorage.getItem("isManualGeolocation")) || false,
      compassPermission: isCompassPermission(compassPermission)
        ? compassPermission
        : "default",
      isRouteFilter:
        !!JSON.parse(localStorage.getItem("isRouteFilter")) || false,
      busSortOrder: isBusSortOrder(busSortOrder) ? busSortOrder : "KMB first",
      numPadOrder: isNumPadOrder(numPadOrder) ? numPadOrder : "123456789c0b",
      etaFormat: isEtaFormat(etaFormat) ? etaFormat : "diff",
      routeSearchHistory:
        Array.isArray(routeSearchHistory) && isStrings(routeSearchHistory)
          ? routeSearchHistory
          : [],
      _colorMode: isColorMode(devicePreferColorScheme)
        ? devicePreferColorScheme
        : "dark",
      energyMode: !!JSON.parse(localStorage.getItem("energyMode")) || false,
      vibrateDuration: JSON.parse(localStorage.getItem("vibrateDuration")) ?? 1,
      isRecentSearchShown: !!JSON.parse(
        localStorage.getItem("isRecentSearchShown") ?? "true"
      ),
      isVisible: true,
      analytics:
        iOSRNWebView() && !iOSTracking()
          ? false
          : JSON.parse(localStorage.getItem("analytics")) ?? true,
      refreshInterval:
        JSON.parse(localStorage.getItem("refreshInterval")) ?? 30000,
      annotateScheduled:
        JSON.parse(localStorage.getItem("annotateScheduled")) ?? false,
      fontSize: JSON.parse(localStorage.getItem("fontSize")) ?? 14,
      lastSearchRange:
        JSON.parse(localStorage.getItem("lastSearchRange")) ??
        defaultSearchRange,
      customSearchRange:
        JSON.parse(localStorage.getItem("customSearchRange")) ?? "",
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
        // @ts-ignore don't use geolocation navigator for Webview
        if (window.iOSRNWebView === true) return;
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
      })
    );
  }, []);

  const setManualGeolocation = useCallback((manualGeolocation: GeoLocation) => {
    setStateRaw(
      produce((state: State) => {
        state.manualGeolocation = manualGeolocation;
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
        // @ts-ignore
        if (window.iOSRNWebView !== true) {
          const _geoWatcherId = navigator.geolocation.watchPosition(
            ({ coords: { latitude, longitude } }) => {
              updateGeolocation({ lat: latitude, lng: longitude });
              setGeoPermission("granted");
            },
            () => {
              setGeoPermission("denied");
              if (deniedCallback) deniedCallback();
            }
          );
          geoWatcherId.current = _geoWatcherId;
        }
      } else if (geoWatcherId.current) {
        navigator.geolocation.clearWatch(geoWatcherId.current);
        geoWatcherId.current = null;
        setGeoPermission(geoPermission);
      } else {
        setGeoPermission(geoPermission);
      }
    },
    [setGeoPermission, updateGeolocation]
  );

  const setIsManualGeolocation = useCallback((isManualGeolocation: boolean) => {
    setStateRaw(
      produce((state: State) => {
        state.isManualGeolocation = isManualGeolocation;
      })
    );
  }, []);

  const setCompassPermission = useCallback(
    (compassPermission: AppState["compassPermission"]) => {
      setState((state) => {
        state.compassPermission = compassPermission;
      });
    },
    [setState]
  );

  const toggleRouteFilter = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prev = state.isRouteFilter;
        const isRouteFilter = prev ? false : true;
        state.isRouteFilter = isRouteFilter;
      })
    );
  }, []);

  const toggleBusSortOrder = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prevOrder = state.busSortOrder;
        const busSortOrder =
          prevOrder === "KMB first" ? "CTB first" : "KMB first";
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
        state.numPadOrder = numPadOrder;
      })
    );
  }, []);

  const toggleEtaFormat = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prev = state.etaFormat;
        const etaFormat = ETA_FORMAT_NEXT_TYPES[prev];
        state.etaFormat = etaFormat;
      })
    );
  }, []);

  const toggleColorMode = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prevColorMode = state._colorMode;
        let colorMode: ColorMode = "dark";
        switch (prevColorMode) {
          case "dark":
            colorMode = "light";
            break;
          case "light":
            colorMode = "system";
            break;
          default:
            colorMode = "dark";
            break;
        }
        state._colorMode = colorMode;
      })
    );
  }, []);

  const toggleEnergyMode = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prevEnergyMode = state.energyMode;
        const energyMode = !prevEnergyMode;
        state.energyMode = energyMode;
      })
    );
  }, []);

  const toggleAnalytics = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prev = state.analytics;
        const analytics = !prev;
        state.analytics = analytics;
      })
    );
  }, []);

  const updateRefreshInterval = useCallback((refreshInterval: number) => {
    setStateRaw(
      produce((state: State) => {
        state.refreshInterval = refreshInterval;
      })
    );
  }, []);

  const toggleAnnotateScheduled = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prev = state.annotateScheduled;
        const annotateScheduled = !prev;
        state.annotateScheduled = annotateScheduled;
      })
    );
  }, []);

  const toggleVibrateDuration = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prevVibrateDuration = state.vibrateDuration;
        const vibrateDuration = prevVibrateDuration ? 0 : 1;
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
      })
    );
  }, []);

  const addSearchHistory = useCallback((route) => {
    setStateRaw(
      produce((state: State) => {
        const newSearchHistory = [route, ...state.routeSearchHistory]
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .slice(0, 20);
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
        state.routeSearchHistory = newSearchHistory;
      })
    );
  }, []);

  const resetUsageRecord = useCallback(() => {
    localStorage.clear();
    setStateRaw(
      produce((state: State) => {
        state.geolocation = defaultGeolocation;
      })
    );
  }, []);

  const toggleIsRecentSearchShown = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prev = state.isRecentSearchShown;
        state.isRecentSearchShown = !prev;
      })
    );
  }, []);

  const changeLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
    },
    [i18n]
  );

  const setFontSize = useCallback((fontSize: number) => {
    setStateRaw(
      produce((state: State) => {
        state.fontSize = fontSize;
      })
    );
  }, []);

  const setLastSearchRange = useCallback((lastSearchRange: number) => {
    setStateRaw(
      produce((state: State) => {
        state.lastSearchRange = lastSearchRange;
      })
    );
  }, []);

  const setCustomSearchRange = useCallback((customSearchRange: number) => {
    setStateRaw(
      produce((state: State) => {
        state.customSearchRange = customSearchRange;
      })
    );
  }, []);

  const colorMode = useMemo(() => {
    if (state._colorMode === "light" || state._colorMode === "dark") {
      return state._colorMode;
    } else {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
  }, [state._colorMode]);

  const importAppState = useCallback((appState: AppState) => {
    setStateRaw(
      produce((state: State) => {
        Object.entries(appState).forEach(([key, value]) => {
          state[key] = value;
        });
      })
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("geolocation", JSON.stringify(state.geolocation));
  }, [state.geolocation]);

  useEffect(() => {
    localStorage.setItem(
      "manualGeolocation",
      JSON.stringify(state.manualGeolocation)
    );
  }, [state.manualGeolocation]);

  useEffect(() => {
    localStorage.setItem(
      "isManualGeolocation",
      JSON.stringify(state.isManualGeolocation)
    );
  }, [state.isManualGeolocation]);

  useEffect(() => {
    localStorage.setItem("geoPermission", state.geoPermission);
  }, [state.geoPermission]);

  useEffect(() => {
    localStorage.setItem("compassPermission", state.compassPermission);
  }, [state.compassPermission]);

  useEffect(() => {
    localStorage.setItem("isRouteFilter", JSON.stringify(state.isRouteFilter));
  }, [state.isRouteFilter]);

  useEffect(() => {
    localStorage.setItem("busSortOrder", state.busSortOrder);
  }, [state.busSortOrder]);

  useEffect(() => {
    localStorage.setItem("numPadOrder", state.numPadOrder);
  }, [state.numPadOrder]);

  useEffect(() => {
    localStorage.setItem("etaFormat", state.etaFormat);
  }, [state.etaFormat]);

  useEffect(() => {
    localStorage.setItem("colorMode", state._colorMode);
  }, [state._colorMode]);

  useEffect(() => {
    localStorage.setItem("energyMode", JSON.stringify(state.energyMode));
  }, [state.energyMode]);

  useEffect(() => {
    localStorage.setItem(
      "isRecentSearchShown",
      JSON.stringify(state.isRecentSearchShown)
    );
  }, [state.isRecentSearchShown]);

  useEffect(() => {
    localStorage.setItem("analytics", JSON.stringify(state.analytics));
  }, [state.analytics]);

  useEffect(() => {
    localStorage.setItem(
      "refreshInterval",
      JSON.stringify(state.refreshInterval)
    );
  }, [state.refreshInterval]);

  useEffect(() => {
    localStorage.setItem(
      "routeSearchHistory",
      JSON.stringify(state.routeSearchHistory)
    );
  }, [state.routeSearchHistory]);

  useEffect(() => {
    localStorage.setItem(
      "annotateScheduled",
      JSON.stringify(state.annotateScheduled)
    );
  }, [state.annotateScheduled]);

  useEffect(() => {
    localStorage.setItem(
      "vibrateDuration",
      JSON.stringify(state.vibrateDuration)
    );
  }, [state.vibrateDuration]);

  useEffect(() => {
    localStorage.setItem("lang", i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    localStorage.setItem("fontSize", JSON.stringify(state.fontSize));
  }, [state.fontSize]);

  useEffect(() => {
    localStorage.setItem(
      "lastSearchRange",
      JSON.stringify(state.lastSearchRange)
    );
  }, [state.lastSearchRange]);

  useEffect(() => {
    localStorage.setItem(
      "customSearchRange",
      JSON.stringify(state.customSearchRange)
    );
  }, [state.customSearchRange]);

  const contextValue = useMemo(() => {
    return {
      ...dbContext,
      ...collectionContext,
      ...state,
      colorMode,
      setSearchRoute,
      updateSearchRouteByButton,
      updateSelectedRoute,
      setCompassPermission,
      updateGeolocation,
      setManualGeolocation,
      setIsManualGeolocation,
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
      toggleAnnotateScheduled,
      toggleIsRecentSearchShown,
      changeLanguage,
      setFontSize,
      importAppState,
      workbox,
      setGeoPermission,
      setLastSearchRange,
      setCustomSearchRange,
    };
  }, [
    dbContext,
    collectionContext,
    state,
    colorMode,
    setSearchRoute,
    updateSearchRouteByButton,
    updateSelectedRoute,
    setCompassPermission,
    updateGeolocation,
    setIsManualGeolocation,
    setManualGeolocation,
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
    toggleAnnotateScheduled,
    toggleIsRecentSearchShown,
    changeLanguage,
    setFontSize,
    importAppState,
    workbox,
    setGeoPermission,
    setLastSearchRange,
    setCustomSearchRange,
  ]);
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;
export type { AppContextValue };
