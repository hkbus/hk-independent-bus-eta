export type ColorMode = "light" | "dark" | "system";

export type NumPadOrder = "789456123c0b" | "123456789c0b";

/**
 * How the sun-side display is drawn, if at all. Each of these came out
 * of the Telegram thread that asked for the feature; the community
 * could not agree on one, so the choice is the rider's.
 *   off   nothing at all (default)
 *   bar   a colour stroke down each stop row's right edge
 *   icon  a sun/seat pictogram on the right of each stop row
 *   text  one plain sentence above the stop list
 *   map   two bars down the map's edges, current stop to terminus
 */
export type SunSideStyle = "off" | "bar" | "icon" | "text" | "map";

export type BusSortOrder = "KMB first" | "CTB first";

export type EtaFormat = "exact" | "diff" | "mixed";

export type Language = "zh" | "en";

export type ManageMode = "order" | "edit";
