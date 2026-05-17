import { useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import { Map, NavigationControl, type MapProps } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { PMTiles, Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";
import { Box, type SxProps, type Theme } from "@mui/material";
import AppContext from "../../../context/AppContext";
import useLanguage from "../../../hooks/useTranslation";
import { buildStyle, VECTOR_PMTILES_URL } from "./style";
import { CachedPMTilesSource } from "./CachedPMTilesSource";

/**
 * Register the `pmtiles://` URL scheme handler with maplibre-gl
 * exactly once per page load, and pre-register the Hong Kong
 * vector archive so its tile reads are served from a
 * Cache-Storage-backed full-file download instead of the network
 * range requests pmtiles would otherwise issue per pan/zoom.
 */
let protocolRegistered = false;
const ensurePMTilesProtocol = () => {
  if (protocolRegistered) return;
  const protocol = new Protocol();
  const source = new CachedPMTilesSource(VECTOR_PMTILES_URL);
  protocol.add(new PMTiles(source));
  maplibregl.addProtocol("pmtiles", protocol.tile);
  protocolRegistered = true;
};

/**
 * Default view centred roughly on Tsim Sha Tsui / Central.
 */
const DEFAULT_VIEW = {
  longitude: 114.17,
  latitude: 22.302711,
  zoom: 13,
};

// Forward the most common <Map> props but make the style/protocol
// concerns the wrapper's job. Anything else can be passed through
// via `...rest`.
type ForwardedProps = Omit<
  MapProps,
  | "mapStyle"
  | "mapLib"
  | "RTLTextPlugin"
  | "children"
  | "style"
  | "initialViewState"
>;

export interface BaseMapProps extends ForwardedProps {
  initialViewState?: Partial<typeof DEFAULT_VIEW> & {
    bearing?: number;
    pitch?: number;
  };
  /** CSS for the container. Defaults to filling its parent. */
  style?: CSSProperties;
  children?: ReactNode;
  /**
   * Render the small Lands Department logo badge in the bottom-right.
   * Default true.
   */
  showLandsDepartmentBadge?: boolean;
  /**
   * Show the built-in +/- zoom control in the top-left.
   * Default true.
   */
  showZoomControl?: boolean;
}

const BaseMap = ({
  initialViewState,
  style = {},
  children,
  showLandsDepartmentBadge = true,
  showZoomControl = true,
  ...rest
}: BaseMapProps) => {
  const { colorMode } = useContext(AppContext);
  const language = useLanguage();

  // Side effect on render is fine here — the guard makes it cheap
  // after the first call and we need the protocol registered before
  // <Map> tries to fetch the style.
  ensurePMTilesProtocol();

  const labelTileUrl = useMemo(() => {
    const tmpl = import.meta.env.VITE_MAP_LABEL_URL as string | undefined;
    if (!tmpl) return undefined;
    return tmpl.replace("{lang}", language === "zh" ? "tc" : "en");
  }, [language]);

  const mapStyle = useMemo(
    () => buildStyle({ colorMode, labelTileUrl }),
    [colorMode, labelTileUrl]
  );

  return (
    <Map
      mapStyle={mapStyle}
      initialViewState={{ ...DEFAULT_VIEW, ...initialViewState }}
      style={{ width: "100%", height: "100%", ...style }}
      maxZoom={20}
      attributionControl={{ compact: true }}
      {...rest}
    >
      {showZoomControl && <NavigationControl position="top-left" />}
      {children}
      {showLandsDepartmentBadge && (
        <Box sx={landsBadgeSx}>
          <img src="/img/Lands_Department.svg" alt="Lands Department" />
        </Box>
      )}
    </Map>
  );
};

export default BaseMap;

const landsBadgeSx: SxProps<Theme> = {
  position: "absolute",
  bottom: 40,
  right: 40,
  width: 32,
  height: 32,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  pointerEvents: "none",
  zIndex: 1,
  "& img": {
    width: 20,
    height: 20,
    opacity: 0.8,
  },
};
