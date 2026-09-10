import SwipeableViewsRaw from "react-swipeable-views";

// ponytail: some esbuild versions double-wrap this package's CJS default
// export via ESM interop, yielding { default, SwipeableViewsContext }
// instead of the component itself. Unwrap defensively so it works either way.
const SwipeableViews: typeof SwipeableViewsRaw =
  (SwipeableViewsRaw as unknown as { default?: typeof SwipeableViewsRaw })
    .default ?? SwipeableViewsRaw;

export default SwipeableViews;
