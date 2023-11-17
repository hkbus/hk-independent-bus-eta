import React, { useCallback, useEffect, useContext, useMemo } from "react";
import AppContext from "./AppContext";

interface ReactNativeContextValue {
  os: "ios" | "android" | null;
}

const ReactNativeContext = React.createContext<ReactNativeContextValue>(null);

export const ReactNativeContextProvider = ({ children }) => {
  const { geoPermission, setGeoPermission, updateGeolocation } =
    useContext(AppContext);

  const os = useMemo<ReactNativeContextValue["os"]>(
    // @ts-ignore
    () => window?.RnOs?.toLowerCase() ?? null,
    []
  );

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
      obj.removeEventListener("message", handleMsg);
    };
  }, [handleMsg, os]);

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

  return (
    <ReactNativeContext.Provider
      value={{
        os,
      }}
    >
      {children}
    </ReactNativeContext.Provider>
  );
};

export default ReactNativeContext;
