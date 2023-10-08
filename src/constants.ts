import { Company } from "hk-bus-eta";
import { BoardTabType } from "./typing";

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
  all: ["kmb", "ctb", "lrtfeeder", "nlb", "gmb", "lightRail", "mtr"],
  bus: ["kmb", "ctb", "lrtfeeder", "nlb"],
  minibus: ["gmb"],
  lightRail: ["lightRail"],
  mtr: ["mtr"],
};

export const TRANSPORT_ORDER = {
  "KMB first": ["kmb", "ctb", "lrtfeeder", "nlb", "gmb", "lightRail", "mtr"],
  "CTB first": ["ctb", "kmb", "lrtfeeder", "nlb", "gmb", "lightRail", "mtr"],
};
