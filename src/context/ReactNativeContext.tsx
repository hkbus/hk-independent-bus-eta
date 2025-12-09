import React, {
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useState,
} from "react";
import AppContext from "./AppContext";
import { useTranslation } from "react-i18next";
import useLanguage from "../hooks/useTranslation";
import DbContext from "./DbContext";

declare global {
  interface Window {
    ReactNativeWebView?: any;
    iOSRNWebView?: boolean;
  }
}

interface ReactNativeContextState {
  alarmStopId: string;
  debug: boolean;
}

interface ReactNativeContextValue extends ReactNativeContextState {
  os: "ios" | "android" | null;
  isStopAlarm: boolean;
  toggleDebug: () => void;
  toggleStopAlarm: (stopId: string) => void;
}

const ReactNativeContext = React.createContext<ReactNativeContextValue>(
  {} as ReactNativeContextValue
);

export const ReactNativeContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { geoPermission, setGeoPermission, updateGeolocation } =
    useContext(AppContext);
  const {
    db: { stopList },
  } = useContext(DbContext);
  const { t } = useTranslation();
  const language = useLanguage();
  const [state, setState] = useState<ReactNativeContextState>(DEFAULT_STATE);

  const toggleDebug = useCallback(() => {
    setState((prev) => ({
      ...prev,
      debug: !prev,
    }));
  }, []);

  const os = useMemo<ReactNativeContextValue["os"]>(() => {
    if (window?.iOSRNWebView === true) return "ios";
    else if (window?.iOSRNWebView === false) return "android";
    return null;
  }, []);

  const isStopAlarm = useMemo<boolean>(() => {
    // @ts-expect-error stopAlarm is defined in the mobile app
    return window?.stopAlarm === true;
  }, []);

  const handleMsg = useCallback(
    (msg: Event & { data?: string }) => {
      try {
        const data = JSON.parse(msg.data ?? "{}");
        if (data.type === "geoPermission") {
          setGeoPermission(data.value);
        } else if (data.type === "location") {
          updateGeolocation({ lat: data.lat, lng: data.lng });
        } else if (data.type === "stop-alarm-stop-id") {
          setState((prev) => ({
            ...prev,
            alarmStopId: data.value,
          }));
        } else if (data.type === "initStorage") {
          for (const k in data.kvs) {
            localStorage.setItem(k, data.kvs[k]);
          }
          localStorage.setItem("iOSInit", "true");
          window.location.reload();
        }
      } catch (e) {
        console.error(e);
      }
    },
    [setGeoPermission, updateGeolocation]
  );

  useEffect(() => {
    let obj: Window | Document | null = null;
    if (os === "ios") {
      obj = window;
    } else if (os === "android") {
      obj = document;
    } else {
      return;
    }
    obj.addEventListener("message", handleMsg);
    return () => {
      if (obj !== null) {
        obj.removeEventListener("message", handleMsg);
      }
    };
  }, [handleMsg, os]);

  const toggleStopAlarm = useCallback(
    (stopId: string) => {
      const stop = stopList[stopId];
      if (!stop) return;
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({
          type: "stop-alarm",
          value: {
            ...stop.location,
            body: t("到站了"),
            title: stop.name[language],
            stopId,
          },
        })
      );
      // @ts-expect-error harmonyBridger is defined in the mobile app
      if (typeof harmonyBridger !== "undefined") {
        // @ts-expect-error harmonyBridger is defined in the mobile app
        harmonyBridger
          ?.toggleAlarm(stopId, stop.location)
          .then((stopId: string) => {
            setState((prev) => ({
              ...prev,
              alarmStopId: stopId,
            }));
          });
      }
    },
    [stopList, t, language]
  );

  // Use mobile geolocation
  useEffect(() => {
    if (window.ReactNativeWebView !== undefined) {
      // react native web view
      if (
        geoPermission === null ||
        geoPermission === "opening" ||
        geoPermission === "force-opening" ||
        geoPermission === "granted"
      ) {
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({
            type: "start-geolocation",
            force: geoPermission === "force-opening",
          })
        );
      } else if (geoPermission === "closed") {
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({
            type: "stop-geolocation",
          })
        );
      }
    }
  }, [geoPermission]);

  useEffect(() => {
    localStorage.setItem("debug", JSON.stringify(state.debug));
  }, [state.debug]);

  // for iOS, override localStorage to use expo Async storage
  useEffect(() => {
    setTimeout(() => {
      if (window.ReactNativeWebView && window.iOSRNWebView === true) {
        // overwrite localstorage setItem
        const { setItem, removeItem, clear } = localStorage;
        localStorage.setItem = function (key: string, value: string) {
          setItem.call(this, key, value);
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "setItem",
              value: {
                key,
                value,
              },
            })
          );
        };
        localStorage.removeItem = function (key: string) {
          removeItem.call(this, key);
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "removeItem",
              value: key,
            })
          );
        };
        localStorage.clear = function () {
          clear.call(this);
          window.ReactNativeWebView!.postMessage(
            JSON.stringify({
              type: "clear",
            })
          );
        };
      }
    }, 10000);
    // obtain all values from storage
    if (
      window.ReactNativeWebView &&
      window.iOSRNWebView === true &&
      localStorage.getItem("iOSInit") !== "true"
    ) {
      window.ReactNativeWebView!.postMessage(
        JSON.stringify({
          type: "multiGet",
        })
      );
    }
  }, []);

  const contextValue: ReactNativeContextValue = useMemo(
    () => ({
      os,
      isStopAlarm,
      ...state,
      toggleDebug,
      toggleStopAlarm,
    }),
    [os, isStopAlarm, state, toggleDebug, toggleStopAlarm]
  );

  return (
    <ReactNativeContext.Provider value={contextValue}>
      {children}
    </ReactNativeContext.Provider>
  );
};

export default ReactNativeContext;

const DEFAULT_STATE: ReactNativeContextState = {
  alarmStopId: "",
  debug: localStorage.getItem("debug") === "true",
};
