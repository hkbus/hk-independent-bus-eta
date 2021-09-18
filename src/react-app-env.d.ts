/// <reference types="react-scripts" />
interface GeoLocation {
  lat: number;
  lng: number;
}

declare module "hk-bus-eta" {
  export interface StopListEntry {
    location: {
      lat: number;
      lng: number;
    };
    name: { zh: string; en: string };
  }
  export interface RouteListEntry {
    bound: Record<string, string>;
    co: string[];
    dest: { zh: string; en: string };
    fares: string[] | null;
    faresHoliday: string[] | null;
    freq: Record<string, Record<string, string[]> | null>;
    nlbId: string | null;
    orig: { zh: string; en: string };
    route: string;
    seq: number;
    serviceType: string;
    stops: Record<string, string[]>;
  }
  export const fetchEtaObj: () => Promise<{
    routeList: Record<string, RouteListEntry>;
    stopList: Record<string, StopListEntry>;
    stopMap: Array<Array<string>>;
  }>;
  export const fetchEtaObjMd5: () => string;
}

interface WarnUpMessageData {
  type: "WARN_UP_MAP_CACHE";
  retinaDisplay: boolean;
  zoomLevels: number[];
  stopList?: StopListEntry[];
}