export interface DaySchedule {
  day: number;
  // use start, end only if allDay is false
  start: {
    hour: number;
    minute: number;
  };
  end: {
    hour: number;
    minute: number;
  };
}

export interface RouteCollection {
  name: string;
  list: string[];
  schedules: DaySchedule[];
}

export type TransportType = "bus" | "minibus" | "lightRail" | "mtr" | "ferry";

export type BoardTabType = "recent" | "all" | TransportType;

export interface SharingEntry {
  routeId: string;
  stopId: string;
  seq: number;
  event: any;
}

declare global {
  interface Window {
    /** Injected by hkbus.app app webview
     * @since Dec 2024
     */
    systemColorSchemeCallbacks?: Function[];
    /** Injected by hkbus.app app webview
     * @since Dec 2024
     * @see https://reactnative.dev/docs/usecolorscheme
     */
    systemColorScheme?: { value: "light" | "dark" | null };
  }
}
