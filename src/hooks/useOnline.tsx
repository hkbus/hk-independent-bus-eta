import { useCallback, useEffect, useState } from "react";

const useOnline = () => {
  console.log(navigator.onLine);
  const [state, setState] = useState<"online" | "offline">(
    navigator.onLine ? "online" : "offline"
  );

  const onlineHandler = useCallback(() => {
    setState("online");
  }, []);

  const offlineHandler = useCallback(() => {
    setState("offline");
  }, []);

  useEffect(() => {
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, [onlineHandler, offlineHandler]);

  return state;
};

export default useOnline;
