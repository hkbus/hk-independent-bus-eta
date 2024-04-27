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
    // @ts-expect-error iOSRNWebView is defined in the mobile app
    if (window?.iOSRNWebView === true) return "ios";
    // @ts-expect-error iOSRNWebView is defined in the mobile app
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
      // @ts-expect-error ReactNativeWebView is defined in the mobile app
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
    // @ts-expect-error ReactNativeWebView is defined in the mobile app
    if (window.ReactNativeWebView !== undefined) {
      // react native web view
      if (
        geoPermission === null ||
        geoPermission === "opening" ||
        geoPermission === "granted"
      ) {
        // @ts-expect-error ReactNativeWebView is defined in the mobile app
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({
            type: "start-geolocation",
          })
        );
      } else if (geoPermission === "closed") {
        // @ts-expect-error ReactNativeWebView is defined in the mobile app
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
