import { useEffect } from "react";

interface Props {
  error: Error;
}

const RELOAD_KEY = "chunk-reload-attempted";

const isChunkError = (error: Error) =>
  error.name === "ChunkLoadError" ||
  /Loading chunk [\d]+ failed/.test(error.message) ||
  /Failed to fetch dynamically imported module/.test(error.message);

const ErrorFallback = ({ error }: Props) => {
  const chunkErr = isChunkError(error);
  const alreadyTried = sessionStorage.getItem(RELOAD_KEY) === "1";

  useEffect(() => {
    if (!chunkErr || alreadyTried) return;
    sessionStorage.setItem(RELOAD_KEY, "1");
    (async () => {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      window.location.reload();
    })();
  }, [alreadyTried, chunkErr, error]);

  if (chunkErr && !alreadyTried) {
    return (
      <div style={{ color: "#fff", fontSize: 18 }}>
        <p>App Updated, reloading...</p>
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", fontSize: 18 }}>
      <span>
        Sorry there is an error. Would you like to report it to the{" "}
        <a className="tg" href="https://t.me/+T245uB32DeNlNjJl">
          Telegram group
        </a>
        ?
      </span>
      <pre>{error.stack ?? "Unknown error"}</pre>
      <button
        onClick={() => {
          sessionStorage.removeItem(RELOAD_KEY);
          window.location.reload();
        }}
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorFallback;
