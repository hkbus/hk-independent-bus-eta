import type { StopListEntry } from "hk-bus-eta";

export interface WarnUpMessageData {
  type: "WARN_UP_MAP_CACHE";
  retinaDisplay: boolean;
  zoomLevels: number[];
  stopList?: StopListEntry[];
}

export interface DaySchedule {
  allDay: boolean;
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

export const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  allDay: true,
  day: 0, // 0: Sunday, 1: Monday, ...
  start: {
    hour: 8,
    minute: 0,
  },
  end: {
    hour: 18,
    minute: 0,
  },
};

export const DEFAULT_ROUTE_COLLECTION: RouteCollection = {
  name: "New Collection",
  list: [],
  schedules: Array(7)
    .fill(0)
    .map((v, idx) => ({
      ...DEFAULT_DAY_SCHEDULE,
      day: idx,
    })),
};
