import { useEffect } from "react";
import type { FallbackProps } from "react-error-boundary";

const RELOAD_KEY = "chunk-reload-attempted";

const isChunkError = (error: unknown) =>
  error instanceof Error &&
  (error.name === "ChunkLoadError" ||
    /Loading chunk [\d]+ failed/.test(error.message) ||
    /Failed to fetch dynamically imported module/.test(error.message));

const describeError = (error: unknown): string => {
  if (error instanceof Error && error.stack) return error.stack;
  if (error && typeof error === "object") {
    const { name, message } = error as { name?: unknown; message?: unknown };
    if (name || message) return `${name ?? "Error"}: ${message ?? ""}`;
    try {
      return JSON.stringify(error);
    } catch {
      return Object.prototype.toString.call(error);
    }
  }
  return `${typeof error}: ${String(error)}`;
};

const resetAndReload = async () => {
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  window.location.reload();
};

const ErrorFallback = ({ error }: FallbackProps) => {
  const chunkErr = isChunkError(error);
  const alreadyTried = sessionStorage.getItem(RELOAD_KEY) === "1";

  useEffect(() => {
    if (!chunkErr || alreadyTried) return;
    sessionStorage.setItem(RELOAD_KEY, "1");
    resetAndReload();
  }, [alreadyTried, chunkErr]);

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
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {describeError(error)}
        {"\n\n"}
        {import.meta.env.VITE_VERSION ?? ""}{" "}
        {import.meta.env.VITE_COMMIT_HASH ?? ""}
        {"\n"}
        {navigator.userAgent}
      </pre>
      <button
        onClick={() => {
          sessionStorage.removeItem(RELOAD_KEY);
          resetAndReload();
        }}
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorFallback;
