import type {
  StyleSpecification,
  RasterSourceSpecification,
  VectorSourceSpecification,
} from "maplibre-gl";
import lightBase from "./styles/light.json";
import darkBase from "./styles/dark.json";

/**
 * Hosted vector PMTiles file produced by hk-pmtiles-generation
 * (workflow: .github/workflows/generate-maptiles.yml → vector job).
 * Single file for both light and dark — the light/dark variation
 * lives in the *style*, not the data.
 */
export const VECTOR_PMTILES_URL = "https://pmtiles.hkbus.app/hong-kong.pmtiles";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';
const LANDS_ATTRIBUTION =
  '&copy; <a href="https://api.portal.hkmapservice.gov.hk/disclaimer" target="_blank">Lands Department</a>';

const LABEL_SOURCE_ID = "lands-labels";
const LABEL_LAYER_ID = "lands-labels";

export interface BuildStyleOpts {
  colorMode: "light" | "dark";
  /**
   * Lands Department raster tile URL template (with {z}/{x}/{y}).
   * Pass `undefined` to render the basemap without the labels overlay
   * — useful in environments where VITE_MAP_LABEL_URL isn't set.
   */
  labelTileUrl?: string;
}

/**
 * Builds a MapLibre StyleSpecification from the Protomaps "basic" style
 * mirrored from hk-pmtiles-generation/render-style{,-dark}.json.
 *
 * Two runtime rewrites are applied:
 *   1. The vector source URL is changed from the renderer-internal
 *      `pmtiles://hong-kong` ref to the hosted CDN URL.
 *   2. (optional) A raster source/layer is appended for the
 *      Lands Department labels overlay so HK place names render
 *      in the correct language.
 */
export const buildStyle = ({
  colorMode,
  labelTileUrl,
}: BuildStyleOpts): StyleSpecification => {
  const base = colorMode === "dark" ? darkBase : lightBase;

  // Deep clone — the imported JSON modules are frozen-ish and we
  // mutate `sources` / `layers` below.
  const style = JSON.parse(JSON.stringify(base)) as StyleSpecification;

  const protomapsSource = style.sources?.protomaps as
    | VectorSourceSpecification
    | undefined;
  if (protomapsSource && "url" in protomapsSource) {
    protomapsSource.url = `pmtiles://${VECTOR_PMTILES_URL}`;
    protomapsSource.attribution = OSM_ATTRIBUTION;
  }

  if (labelTileUrl) {
    const rasterSource: RasterSourceSpecification = {
      type: "raster",
      tiles: [labelTileUrl],
      tileSize: 256,
      attribution: LANDS_ATTRIBUTION,
    };
    style.sources[LABEL_SOURCE_ID] = rasterSource;
    style.layers.push({
      id: LABEL_LAYER_ID,
      type: "raster",
      source: LABEL_SOURCE_ID,
    });
  }
  return style;
};
