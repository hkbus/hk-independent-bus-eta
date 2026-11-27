import { useContext, useEffect, useMemo, useState } from "react";
import type { Location } from "hk-bus-eta";
import throttle from "lodash.throttle";
import AppContext from "../context/AppContext";

// AppContext keeps the device location in a ref (no re-render per GPS tick),
// so poll it into state; throttled to avoid rapid UI changes
const useGeolocation = () => {
  const { manualGeolocation, geolocation } = useContext(AppContext);
  const [state, setState] = useState<Location>(
    manualGeolocation ?? geolocation.current
  );
  const throttleUpdateGeolocation = useMemo(
    () => throttle((v: Location) => setState(v), 500),
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      throttleUpdateGeolocation(manualGeolocation ?? geolocation.current);
    }, 1000);
    throttleUpdateGeolocation(manualGeolocation ?? geolocation.current);
    return () => {
      clearInterval(interval);
    };
  }, [manualGeolocation, geolocation, throttleUpdateGeolocation]);

  return state;
};

export default useGeolocation;
