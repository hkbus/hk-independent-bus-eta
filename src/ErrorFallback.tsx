import { useEffect } from "react";

interface Props {
  error: Error;
}

const ErrorFallback = ({ error }: Props) => {
  useEffect(() => {
    if (error.name === "ChunkLoadError" || error.name === "TypeError") {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [error]);

  if (error.name === "ChunkLoadError" || error.name === "TypeError") {
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
        <a className="tg" href="https://t.me/hkbusapp">
          Telegram group
        </a>
        ?
      </span>
      <pre>{error.stack ?? "Unknown error"}</pre>
    </div>
  );
};

export default ErrorFallback;
