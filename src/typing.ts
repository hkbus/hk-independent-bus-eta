import type { StopListEntry } from "hk-bus-eta";
import type { Theme as MUITheme } from "@mui/material/styles";
export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface WarnUpMessageData {
  type: "WARN_UP_MAP_CACHE";
  retinaDisplay: boolean;
  zoomLevels: number[];
  stopList?: StopListEntry[];
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Theme extends MUITheme {}
