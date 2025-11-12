import { layers, namedFlavor } from "@protomaps/basemaps";

export const createMapStyle = (colorMode: "light" | "dark" = "light") => {
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
  };
};
