import { Company } from "hk-bus-eta";
import { BoardTabType, DaySchedule, RouteCollection } from "./@types/types";

export const ETA_FORMAT_NEXT_TYPES: {
  [format: string]: "diff" | "exact" | "mixed";
} = {
  diff: "exact",
  exact: "mixed",
  mixed: "diff",
};

export const ETA_FORMAT_STR = {
  diff: "到站時差",
  exact: "到站時間",
  mixed: "到站時間（到站時差）",
};

export const TRANSPORT_SEARCH_OPTIONS: Record<BoardTabType, Company[]> = {
  recent: ["kmb", "ctb", "lrtfeeder", "nlb", "gmb", "lightRail", "mtr"],
  all: ["kmb", "ctb", "lrtfeeder", "nlb", "gmb", "lightRail", "mtr", "sunferry", "fortuneferry", "hkkf"],
  bus: ["kmb", "ctb", "lrtfeeder", "nlb"],
  minibus: ["gmb"],
  lightRail: ["lightRail"],
  mtr: ["mtr"],
  ferry: ["sunferry", "fortuneferry", "hkkf"],
};

export const TRANSPORT_ORDER = {
  "KMB first": ["kmb", "ctb", "lrtfeeder", "nlb", "gmb", "lightRail", "mtr"],
  "CTB first": ["ctb", "kmb", "lrtfeeder", "nlb", "gmb", "lightRail", "mtr"],
  // backward compatability, could be deleted after 2023
  "CTB-NWFB first": [
    "ctb",
    "kmb",
    "lrtfeeder",
    "nlb",
    "gmb",
    "lightRail",
    "mtr",
  ],
};

export const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  day: 0, // 0: Sunday, 1: Monday, ...
  start: {
    hour: 0,
    minute: 0,
  },
  end: {
    hour: 23,
    minute: 59,
  },
};

export const DEFAULT_ROUTE_COLLECTION: RouteCollection = {
  name: "New Collection",
  list: [],
  schedules: Array(7)
    .fill(0)
    .map((_, idx) => ({
      ...DEFAULT_DAY_SCHEDULE,
      day: idx,
    })),
};
