import type { StopListEntry } from "hk-bus-eta";

export interface WarnUpMessageData {
  type: "WARN_UP_MAP_CACHE";
  retinaDisplay: boolean;
  zoomLevels: number[];
  stopList?: StopListEntry[];
}
