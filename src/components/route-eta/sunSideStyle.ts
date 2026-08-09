/**
 * Shared look for the sun-side display, so the strip above the stop
 * list and the stripes down each stop can never drift apart.
 *
 * Deep orange rather than a soft amber: the app's own light theme is
 * yellow, and an amber stripe on it says nothing.
 */

/**
 * Below which the sun is too close to straight ahead, straight behind,
 * or straight overhead for either side of the bus to be the better
 * one to sit on.
 */
export const SUN_SIDE_THRESHOLD = 0.15;
/** Where the sun stops getting any more sideways-on, for scaling. */
export const SUN_SIDE_FULL = 0.6;

/** 0 … 1 — how squarely the sun is on the side of the bus. */
export const sunSideStrength = (side: number): number =>
  Math.min(1, Math.abs(side) / SUN_SIDE_FULL);

/** The side taking the sun. */
export const sunlitColour = (strength: number): string =>
  `rgba(230, 81, 0, ${(0.4 + 0.6 * strength).toFixed(2)})`;

/** The side in shade — the one to sit on. */
export const shadedColour = (strength: number): string =>
  `rgba(21, 58, 95, ${(0.35 + 0.55 * strength).toFixed(2)})`;

/** Neither side is meaningfully better here. */
export const NEUTRAL_COLOUR = "rgba(130, 130, 130, 0.3)";

/**
 * The per-stop bar under each row. Solid, because there the length of
 * the bar already carries the strength — fading it too would say the
 * same thing twice and weaken both.
 */
export const SUN_BAR_COLOUR = "rgba(230, 81, 0, 0.9)";

/** The seat to take — the shaded side. */
export const SEAT_COLOUR = "rgba(2, 119, 189, 0.9)";

/**
 * One lane of the map-side display, as a hard-stopped CSS gradient:
 * one band per leg, so a lane stays a single element however many
 * stops a route has.
 */
export const buildLaneGradient = (
  sides: number[],
  lane: "left" | "right",
  edges: number[],
  direction: "to right" | "to bottom" = "to bottom"
): string => {
  const bands = sides.map((side, i) => {
    let colour: string;
    if (Math.abs(side) < SUN_SIDE_THRESHOLD) {
      colour = NEUTRAL_COLOUR;
    } else {
      const strength = sunSideStrength(side);
      const sunOnThisLane = lane === "left" ? side < 0 : side > 0;
      colour = sunOnThisLane ? sunlitColour(strength) : shadedColour(strength);
    }
    return `${colour} ${edges[i].toFixed(3)}% ${edges[i + 1].toFixed(3)}%`;
  });
  return `linear-gradient(${direction}, ${bands.join(", ")})`;
};

/** Cumulative share of the route's length at each leg boundary. */
export const laneBoundaries = (count: number, weights?: number[]): number[] => {
  const w =
    weights && weights.length === count && weights.some((x) => x > 0)
      ? weights
      : new Array(count).fill(1);
  const total = w.reduce((a, b) => a + b, 0);
  const out = [0];
  let acc = 0;
  for (let i = 0; i < count; ++i) {
    acc += w[i];
    out.push((acc / total) * 100);
  }
  return out;
};
