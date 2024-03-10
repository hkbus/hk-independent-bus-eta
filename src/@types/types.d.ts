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

export type TransportType = "bus" | "minibus" | "lightRail" | "mtr";

export type BoardTabType = "recent" | "all" | TransportType;
