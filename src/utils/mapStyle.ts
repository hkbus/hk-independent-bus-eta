import { layers, namedFlavor } from "@protomaps/basemaps";

export const createMapStyle = (
  colorMode: "light" | "dark" = "light",
  mapStyleType: "vector" | "raster" = "vector"
) => {
  if (mapStyleType === "raster") {
    const rasterUrl =
      colorMode === "dark"
        ? "pmtiles://https://anscg.github.io/hk-pmtiles-generation/hong-kong-raster-dark.pmtiles.gz"
        : "pmtiles://https://anscg.github.io/hk-pmtiles-generation/hong-kong-raster.pmtiles.gz";
    return {
      version: 8,
      glyphs:
        "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
      sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${colorMode}`,
      sources: {
        rasterpmtiles: {
          type: "raster",
          url: rasterUrl,
          tileSize: 512,
          attribution:
            '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        },
        textpmtiles: {
          type: "vector",
          url: "pmtiles://https://anscg.github.io/hk-pmtiles-generation/hong-kong-labels.pmtiles.gz",
        },
      },
      layers: [
        {
          id: "rasterpmtiles",
          type: "raster",
          source: "rasterpmtiles",
          "raster-resampling": "nearest",
        },
      ],
    } as const;
  }

  return {
    version: 8,
    glyphs:
      "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${colorMode}`,
    sources: {
      protomaps: {
        type: "vector",
        url: "pmtiles://https://anscg.github.io/hk-pmtiles-generation/hong-kong.pmtiles.gz",
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: layers("protomaps", namedFlavor(colorMode), { lang: "en" }),
  } as const;
};

export const ensureRasterLabelLayers = async (
  map: import("maplibre-gl").Map,
  colorMode: "light" | "dark"
) => {
  try {
    const vectorSourceId = "protomaps";
    if (!map.getSource(vectorSourceId)) {
      map.addSource(vectorSourceId, {
        type: "vector",
        url: "pmtiles://https://anscg.github.io/hk-pmtiles-generation/hong-kong.pmtiles.gz",
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      } as any);
    }

    const url =
      colorMode === "dark"
        ? "/map/raster-styles-dark.json"
        : "/map/raster-styles.json";
    const res = await fetch(url);
    if (!res.ok) return;
    const layers = (await res.json()) as any[];
    if (!Array.isArray(layers)) return;
    // Determine insertion point: below route/overlay lines but above raster base.
    const style = map.getStyle();
    let beforeId: string | undefined = undefined;
    if (style && Array.isArray(style.layers)) {
      const overlayLayer = style.layers.find((l) =>
        /^(route-path-|route-\d+-line|walk-\d+-layer|range-circle-layer)/.test(
          l.id
        )
      );
      if (overlayLayer) beforeId = overlayLayer.id; // insert beneath first overlay
    }

    for (const layer of layers) {
      try {
        if (!map.getLayer(layer.id)) {
          // If we have an overlay target, insert before it; otherwise append (above raster).
          if (beforeId) {
            map.addLayer(layer as any, beforeId);
          } else {
            map.addLayer(layer as any);
          }
        }
      } catch (e) {
        console.warn("Failed to add label layer", layer?.id, e);
      }
    }
  } catch (e) {
    console.warn("Failed ensuring raster label layers", e);
  }
};
