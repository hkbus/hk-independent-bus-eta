/**
 * I - inbound, O - outbound
 */
export type BoundType = "O" | "I";
export interface StopListEntry {
  location: {
    lat: number;
    lng: number;
  };
  name: { zh: string; en: string };
}
export interface RouteListEntry {
  bound: Record<string, BoundType>;
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
