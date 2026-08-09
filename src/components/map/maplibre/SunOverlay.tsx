import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import {
  NightsStay as NightsStayIcon,
  WbSunny as WbSunnyIcon,
  WbSunnyOutlined as WbSunnyOutlinedIcon,
} from "@mui/icons-material";
import { useMap } from "react-map-gl/maplibre";
import { useTranslation } from "react-i18next";

interface SunOverlayProps {
  /** Bearing of the sun, degrees clockwise from true north. */
  azimuth: number;
  /** Height of the sun above the horizon, in degrees. */
  altitude: number;
  /** Whether the sun-side display is switched on. */
  active: boolean;
  onToggle: () => void;
}

/**
 * Keeps a sun badge pinned to the edge of the map in the sun's real
 * direction, and — while switched on — washes that side of the map
 * warm. Together with the stop list, which names the side in words,
 * it turns "which side of the bus gets the sun" into something you can
 * see rather than work out.
 *
 * The badge is also the switch for the whole feature, so the sun sits
 * out at the edge instead of a button taking up room in the middle,
 * and nobody who doesn't tap it ever sees the rest.
 *
 * Rendered as an absolutely-positioned overlay inside `<BaseMap>` and
 * kept in step with the map's own rotation.
 */
const SunOverlay = ({
  azimuth,
  altitude,
  active,
  onToggle,
}: SunOverlayProps) => {
  const { current: mapRef } = useMap();
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [bearing, setBearing] = useState<number>(0);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;
    const sync = () => setBearing(map.getBearing());
    sync();
    map.on("rotate", sync);
    return () => {
      map.off("rotate", sync);
    };
  }, [mapRef]);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Below the horizon there is nothing to draw, but the badge stays —
  // as a moon, saying so. Dropping it would leave "the sun is down"
  // and "this app has no such feature" looking identical.
  const isUp = altitude > 0;
  // Where the sun sits on screen: 0° = towards the top of the map.
  const screenAzimuth = (azimuth - bearing + 360) % 360;
  // A sun overhead lights both sides of the bus about equally; a low
  // one comes in sideways. Drives how strongly the wash reads.
  const glare = Math.cos((altitude * Math.PI) / 180);
  const badge = size ? edgePosition(screenAzimuth, size.w, size.h) : null;

  return (
    <Box sx={rootSx} ref={rootRef}>
      {active && isUp && (
        <Box sx={washSx} style={falloffStyle(screenAzimuth)}>
          <Box sx={wavesSx} style={sunlightStyle(screenAzimuth, glare)} />
        </Box>
      )}
      {badge !== null &&
        (isUp ? (
          <Box
            sx={active ? activeBadgeSx : badgeSx}
            style={{ left: badge.x, top: badge.y }}
            onClick={onToggle}
            aria-hidden="true"
            title={t("防曬模式")}
          >
            {active ? (
              <WbSunnyIcon sx={iconSx} />
            ) : (
              <WbSunnyOutlinedIcon sx={iconSx} />
            )}
          </Box>
        ) : (
          // Sun down: still say so, and still let it be switched on so
          // the stop list can explain when it will next be of use.
          <Box
            sx={nightBadgeSx}
            style={{ left: badge.x, top: badge.y }}
            onClick={onToggle}
            aria-hidden="true"
            title={t("太陽已下山")}
          >
            <NightsStayIcon sx={iconSx} />
          </Box>
        ))}
    </Box>
  );
};

export default SunOverlay;

/**
 * Room kept clear along each edge so the badge never lands on the
 * zoom buttons (top-left), the recentre and compass buttons or the
 * Lands Department mark (right), or the attribution bar (bottom).
 */
const EDGE_INSET = { top: 20, right: 46, bottom: 46, left: 46 };

/**
 * Walks a ray out from the middle of the map along `screenAzimuth`
 * and returns where it meets the inset edge — so the badge sits on
 * the rim on the sun's side, whatever the map's shape.
 */
const edgePosition = (
  screenAzimuth: number,
  width: number,
  height: number
): { x: number; y: number } => {
  const rad = (screenAzimuth * Math.PI) / 180;
  // Screen axes: x grows right, y grows downwards.
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const halfW = width / 2;
  const halfH = height / 2;
  const limitX = Math.max(
    0,
    dx > 0 ? halfW - EDGE_INSET.right : halfW - EDGE_INSET.left
  );
  const limitY = Math.max(
    0,
    dy > 0 ? halfH - EDGE_INSET.bottom : halfH - EDGE_INSET.top
  );
  const tx = Math.abs(dx) < 1e-6 ? Infinity : limitX / Math.abs(dx);
  const ty = Math.abs(dy) < 1e-6 ? Infinity : limitY / Math.abs(dy);
  const t = Math.min(tx, ty);
  return { x: halfW + dx * t, y: halfH + dy * t };
};

const rootSx: SxProps<Theme> = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  overflow: "hidden",
  zIndex: 1,
};

/** One full wavefront period, in screen pixels. */
const WAVE_PERIOD = 34;

const washSx: SxProps<Theme> = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
};

/**
 * Fades the light out as it crosses to the shaded side. Lives on the
 * still outer box, not the moving inner one, so the falloff stays put
 * while the wavefronts travel through it.
 */
const falloffStyle = (screenAzimuth: number): CSSProperties => {
  const falloff =
    `linear-gradient(${screenAzimuth.toFixed(1)}deg, ` +
    `rgba(0,0,0,0) 18%, rgba(0,0,0,1) 100%)`;
  return { maskImage: falloff, WebkitMaskImage: falloff };
};

/**
 * Sunlight as an orange field crossed by pale wavefronts rolling in
 * from the sun's side.
 *
 * The wavefronts sit square across the sun's direction rather than
 * along it: the sun is far enough away that its light arrives as a
 * plane wave, and bands drawn *along* the direction would read as
 * streaks blowing over the map rather than light falling on it.
 *
 * Travel is one whole period per cycle along the away-from-the-sun
 * axis, which is what makes the loop seamless — and what makes the
 * direction unmistakable, since parallel bands on their own look the
 * same coming and going.
 */
const sunlightStyle = (screenAzimuth: number, glare: number): CSSProperties => {
  const angle = `${screenAzimuth.toFixed(1)}deg`;
  const rad = (screenAzimuth * Math.PI) / 180;
  const field = (0.22 + 0.2 * glare).toFixed(3);
  const crest = (0.45 + 0.3 * glare).toFixed(3);
  return {
    backgroundImage:
      // Pale crests — a long trough and a short bright top, so they
      // read as distinct wavefronts rather than a soft ripple…
      `repeating-linear-gradient(${angle}, ` +
      `rgba(255,255,255,0) 0px, rgba(255,255,255,0) 19px, ` +
      `rgba(255,255,255,${crest}) 26px, ` +
      `rgba(255,255,255,${crest}) 28px, ` +
      `rgba(255,255,255,0) ${WAVE_PERIOD}px), ` +
      // …over a flat orange field.
      `linear-gradient(rgba(255,138,20,${field}), rgba(255,138,20,${field}))`,
    // Away from the sun is the screen azimuth turned through 180°.
    "--sun-wave-x": `${(-Math.sin(rad) * WAVE_PERIOD).toFixed(2)}px`,
    "--sun-wave-y": `${(Math.cos(rad) * WAVE_PERIOD).toFixed(2)}px`,
  } as CSSProperties;
};

/**
 * Oversized so no edge of the pattern ever slides into view, and
 * still for anyone who has asked their device for less motion.
 */
const wavesSx: SxProps<Theme> = {
  position: "absolute",
  inset: `-${WAVE_PERIOD * 2}px`,
  "@keyframes sunlightWaves": {
    from: { transform: "translate(0px, 0px)" },
    to: {
      transform: "translate(var(--sun-wave-x, 0px), var(--sun-wave-y, 0px))",
    },
  },
  animation: "sunlightWaves 2.8s linear infinite",
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
};

const badgeSx: SxProps<Theme> = {
  position: "absolute",
  transform: "translate(-50%, -50%)",
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  pointerEvents: "auto",
  background: "rgba(255,255,255,0.92)",
  color: "#f9a825",
  boxShadow: "0 1px 5px rgba(0,0,0,0.4)",
};

const activeBadgeSx: SxProps<Theme> = {
  ...(badgeSx as object),
  background: "#ffffff",
  boxShadow: "0 0 12px 3px rgba(255,167,38,0.85)",
};

const nightBadgeSx: SxProps<Theme> = {
  ...(badgeSx as object),
  background: "rgba(38, 50, 70, 0.92)",
  color: "#cfd8dc",
};

const iconSx: SxProps<Theme> = {
  fontSize: 20,
  color: "inherit",
};
