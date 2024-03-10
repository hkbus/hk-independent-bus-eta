import React, {
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useState,
} from "react";
import AppContext from "./AppContext";
import { useTranslation } from "react-i18next";
import useLanguage from "./hooks/useTranslation";

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

const ReactNativeContext = React.createContext<ReactNativeContextValue>({} as ReactNativeContextValue);

export const ReactNativeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    geoPermission,
    setGeoPermission,
    updateGeolocation,
    db: { stopList },
  } = useContext(AppContext);
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
    // @ts-ignore
    if (window?.iOSRNWebView === true) return "ios";
    // @ts-ignore
    else if (window?.iOSRNWebView === false) return "android";
    return null;
  }, []);

  const isStopAlarm = useMemo<boolean>(() => {
    // @ts-ignore
    return window?.stopAlarm === true;
  }, []);

  const handleMsg = useCallback(
    (msg: Event & {data?: string}) => {
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
        }
      } catch (e) {}
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
      // @ts-ignore
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
    },
    [stopList, t, language]
  );

  useEffect(() => {
    // @ts-ignore
    if (window.ReactNativeWebView !== undefined) {
      // react native web view
      if (
        geoPermission === null ||
        geoPermission === "opening" ||
        geoPermission === "granted"
      ) {
        // @ts-ignore
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({
            type: "start-geolocation",
          })
        );
      } else if (geoPermission === "closed") {
        // @ts-ignore
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

  return (
    <ReactNativeContext.Provider
      value={{
        os,
        isStopAlarm,
        ...state,
        toggleDebug,
        toggleStopAlarm,
      }}
    >
      {children}
    </ReactNativeContext.Provider>
  );
};

export default ReactNativeContext;

const DEFAULT_STATE: ReactNativeContextState = {
  alarmStopId: "",
  debug: localStorage.getItem("debug") === "true",
};
