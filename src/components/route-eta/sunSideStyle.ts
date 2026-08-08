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
