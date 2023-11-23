import React, {
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useState,
} from "react";
import AppContext from "./AppContext";

interface ReactNativeContextValue {
  os: "ios" | "android" | null;
  debug: boolean;
  toggleDebug: () => void;
}

const ReactNativeContext = React.createContext<ReactNativeContextValue>(null);

export const ReactNativeContextProvider = ({ children }) => {
  const { geoPermission, setGeoPermission, updateGeolocation } =
    useContext(AppContext);
  const [debug, setDebug] = useState<boolean>(
    localStorage.getItem("debug") === "true"
  );

  const toggleDebug = useCallback(() => {
    setDebug((prev) => !prev);
  }, []);

  const os = useMemo<ReactNativeContextValue["os"]>(() => {
    // @ts-ignore
    if (window?.iOSRNWebView === true) return "ios";
    // @ts-ignore
    else if (window?.iOSRNWebView === false) return "android";
    return null;
  }, []);

  const handleMsg = useCallback(
    (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === "geoPermission") {
          setGeoPermission(data.value);
        } else if (data.type === "location") {
          updateGeolocation({ lat: data.lat, lng: data.lng });
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
  }, [handleMsg, os, debug]);

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
    localStorage.setItem("debug", JSON.stringify(debug));
  }, [debug]);

  return (
    <ReactNativeContext.Provider
      value={{
        os,
        debug,
        toggleDebug,
      }}
    >
      {children}
    </ReactNativeContext.Provider>
  );
};

export default ReactNativeContext;
