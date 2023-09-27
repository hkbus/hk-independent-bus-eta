import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { error: _ };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", errorInfo);
  }

  public render() {
    if (this.state.error) {
      if (this.state.error.name === "ChunkLoadError") {
        return (
          <div style={{ color: "#fff", fontSize: 18 }}>
            <p>Reloading the app a few times could solve this error.</p>
            <span>
              You may also seek support from{" "}
              <a className="tg" href="https://t.me/hkbusapp">
                Telegram group
              </a>
            </span>
            <pre>{this.state.error?.stack ?? "Unknown error"}</pre>
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
          <pre>{this.state.error?.stack ?? "Unknown error"}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
