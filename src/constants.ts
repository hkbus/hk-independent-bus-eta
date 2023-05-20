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

export const TRANSPORT_SEARCH_OPTIONS = {
  recent: ["kmb", "ctb", "nwfb", "lrtfeeder", "nlb", "gmb", "lightRail", "mtr"],
  all: ["kmb", "ctb", "nwfb", "lrtfeeder", "nlb", "gmb", "lightRail", "mtr"],
  bus: ["kmb", "ctb", "nwfb", "lrtfeeder", "nlb"],
  minibus: ["gmb"],
  lightRail: ["lightRail"],
  mtr: ["mtr"],
};

export const TRANSPORT_ORDER = {
  "KMB first": [
    "kmb",
    "ctb",
    "nwfb",
    "lrtfeeder",
    "nlb",
    "gmb",
    "lightRail",
    "mtr",
  ],
  "CTB-NWFB first": [
    "ctb",
    "nwfb",
    "kmb",
    "lrtfeeder",
    "nlb",
    "gmb",
    "lightRail",
    "mtr",
  ],
};
