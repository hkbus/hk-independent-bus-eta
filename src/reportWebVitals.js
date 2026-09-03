const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export const sendToGoogleAnalytics = ({ name, delta, value, id }) => {
  if (!window.gtag) {
    console.log("gtag not found");
    return;
  }
  // Assumes the global `gtag()` function exists, see:
  // https://developers.google.com/analytics/devguides/collection/ga4
  window.gtag("event", name, {
    // Built-in params:
    value: delta, // Use `delta` so the value can be summed.
    // Custom params:
    metric_id: id, // Needed to aggregate events.
    metric_value: value, // Optional.
    metric_delta: delta, // Optional.

    // OPTIONAL: any additional params or debug info here.
    // See: https://web.dev/debug-web-vitals-in-the-field/
    // metric_rating: 'good' | 'ni' | 'poor',
    // debug_info: '...',
    // ...
  });
};

export default reportWebVitals;
