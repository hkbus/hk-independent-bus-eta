import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { vibrate } from "./utils";
import DbContext from "./DbContext";
import type { DatabaseContextValue } from "./DbContext";
import { Workbox } from "workbox-window";
import { produce, freeze, current } from "immer";
import type { Location as GeoLocation } from "hk-bus-eta";

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
  savedEtas: string[];
  /**
   * filter routes by route schedule against time
   */
  isRouteFilter: boolean;
  /**
   * possible Char for RouteInputPad
   */
  possibleChar: string[];
  /**
   * time display format
   */
  etaFormat: "exact" | "diff";
  colorMode: "dark" | "light";
  /**
   * energy saving mode
   */
  energyMode: boolean;
  /**
   * check if window is on active in mobile
   */
  isVisible: boolean;
}

interface AppContextValue extends AppState, DatabaseContextValue {
  setSearchRoute: (searchRoute: string) => void;
  updateSearchRouteByButton: (buttonValue: string) => void;
  updateSelectedRoute: (route: string, seq?: string) => void;
  // UX
  updateGeolocation: (geoLocation: GeoLocation) => void;
  updateSavedEtas: (keys: string) => void;
  resetUsageRecord: () => void;
  // settings
  updateGeoPermission: (
    geoPermission: AppState["geoPermission"],
    deniedCallback?: () => void
  ) => void;
  toggleRouteFilter: () => void;
  toggleEtaFormat: () => void;
  toggleColorMode: () => void;
  toggleEnergyMode: () => void;
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

const isEtaFormat = (input: unknown): input is AppState["etaFormat"] => {
  return input === "exact" || input === "diff";
};

const isStrings = (input: unknown[]): input is string[] => {
  if (input.some((v) => typeof v !== "string")) {
    return false;
  }
  return true;
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
  const { routeList } = dbContext.db;
  const getInitialState = (): AppState => {
    const devicePreferColorScheme =
      localStorage.getItem("colorMode") ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    const searchRoute = "";
    const geoPermission: unknown = localStorage.getItem("geoPermission");
    const geoLocation: unknown = JSON.parse(
      localStorage.getItem("geolocation")
    );
    const etaFormat: unknown = localStorage.getItem("etaFormat");
    const savedEtas: unknown = JSON.parse(localStorage.getItem("savedEtas"));
    const hotRoute: unknown = JSON.parse(localStorage.getItem("hotRoute"));
    return {
      searchRoute: searchRoute,
      selectedRoute: "1-1-CHUK-YUEN-ESTATE-STAR-FERRY",
      geoPermission: isGeoPremission(geoPermission) ? geoPermission : null,
      geolocation: isGeoLocation(geoLocation)
        ? geoLocation
        : defaultGeolocation,
      hotRoute: isNumberRecord(hotRoute) ? hotRoute : {},
      savedEtas:
        Array.isArray(savedEtas) && isStrings(savedEtas) ? savedEtas : [],
      isRouteFilter:
        !!JSON.parse(localStorage.getItem("isRouteFilter")) || false,
      possibleChar: getPossibleChar(searchRoute, routeList) || [],
      etaFormat: isEtaFormat(etaFormat) ? etaFormat : "diff",
      colorMode: isColorMode(devicePreferColorScheme)
        ? devicePreferColorScheme
        : "light",
      energyMode: !!JSON.parse(localStorage.getItem("energyMode")) || false,
      isVisible: true,
    };
  };
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

  const toggleEtaFormat = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const prev = state.etaFormat;
        const etaFormat = prev === "diff" ? "exact" : "diff";
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

  const updateSearchRouteByButton = useCallback(
    (buttonValue: string) => {
      vibrate(1);
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
            state.possibleChar = getPossibleChar(ret, routeList);
          })
        );
      }, 0);
    },
    [routeList]
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

  const updateSavedEtas = useCallback((key: string) => {
    setStateRaw(
      produce((state: State) => {
        const prevSavedEtas = state.savedEtas;
        if (prevSavedEtas.includes(key)) {
          prevSavedEtas.splice(prevSavedEtas.indexOf(key), 1);
          localStorage.setItem(
            "savedEtas",
            JSON.stringify(current(prevSavedEtas))
          );
          state.savedEtas = prevSavedEtas;
          return;
        }
        const newSavedEtas = prevSavedEtas
          .concat(key)
          .filter((v, i, s) => s.indexOf(v) === i);
        localStorage.setItem("savedEtas", JSON.stringify(newSavedEtas));
        state.savedEtas = newSavedEtas;
      })
    );
  }, []);

  const resetUsageRecord = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        state.hotRoute = {};
        state.geolocation = defaultGeolocation;
        state.savedEtas = [];
      })
    );
  }, []);

  const contextValue = useMemo(() => {
    return {
      ...dbContext,
      ...state,
      setSearchRoute,
      updateSearchRouteByButton,
      updateSelectedRoute,
      updateGeolocation,
      updateSavedEtas,
      resetUsageRecord,
      updateGeoPermission,
      toggleRouteFilter,
      toggleEtaFormat,
      toggleColorMode,
      toggleEnergyMode,
      workbox,
    };
  }, [
    dbContext,
    state,
    setSearchRoute,
    updateSearchRouteByButton,
    updateSelectedRoute,
    updateGeolocation,
    updateSavedEtas,
    resetUsageRecord,
    updateGeoPermission,
    toggleRouteFilter,
    toggleEtaFormat,
    toggleColorMode,
    toggleEnergyMode,
    workbox,
  ]);
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;
export type { AppContextValue };

const getPossibleChar = (
  searchRoute: string,
  routeList: Record<string, unknown>
) => {
  if (routeList == null) return [];
  let possibleChar = {};
  Object.entries(routeList).forEach((route) => {
    if (route[0].startsWith(searchRoute.toUpperCase())) {
      let c = route[0].slice(searchRoute.length, searchRoute.length + 1);
      possibleChar[c] = isNaN(possibleChar[c]) ? 1 : possibleChar[c] + 1;
    }
  });
  return Object.entries(possibleChar)
    .map((k) => k[0])
    .filter((k) => k !== "-");
};
