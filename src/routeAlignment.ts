import type { Location as GeoLocation } from "hk-bus-eta";

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const METRE_PER_DEG_LAT = 111320;
const HORIZON_EXTINCTION_LIMIT_DEG = 6;
const SEARCH_CELL_METRES = 250;
const MAX_SEARCH_RADIUS_METRES = 64000;

const atmosphericRefractionDeg = (elevationDeg: number) => {
  if (elevationDeg > 85) return 0;
  const tangent = Math.tan(elevationDeg * RAD);
  if (elevationDeg > 5) {
    return (
      (58.1 / tangent -
        0.07 / Math.pow(tangent, 3) +
        0.000086 / Math.pow(tangent, 5)) /
      3600
    );
  }
  if (elevationDeg > -0.575) {
    return (
      (1735 +
        elevationDeg *
          (-518.2 +
            elevationDeg *
              (103.4 + elevationDeg * (-12.79 + elevationDeg * 0.711)))) /
      3600
    );
  }
  return -20.772 / tangent / 3600;
};

const getSolarPosition = (
  date: Date,
  { lat, lng }: GeoLocation
): { azi: number; ele: number } => {
  // Coefficients are NOAA's. https://gml.noaa.gov/grad/solcalc/calcdetails.html
  const julianDay = date.getTime() / 86400000 + 2440587.5;
  const century = (julianDay - 2451545) / 36525;

  const meanLongitude =
    280.46646 + century * (36000.76983 + century * 0.0003032);
  const meanAnomaly = 357.52911 + century * (35999.05029 - 0.0001537 * century);
  const eccentricity =
    0.016708634 - century * (0.000042037 + 0.0000001267 * century);
  const equationOfCentre =
    Math.sin(meanAnomaly * RAD) *
      (1.914602 - century * (0.004817 + 0.000014 * century)) +
    Math.sin(2 * meanAnomaly * RAD) * (0.019993 - 0.000101 * century) +
    Math.sin(3 * meanAnomaly * RAD) * 0.000289;

  const ascendingNode = 125.04 - 1934.136 * century;
  const apparentLongitude =
    meanLongitude +
    equationOfCentre -
    0.00569 -
    0.00478 * Math.sin(ascendingNode * RAD);
  const meanObliquity =
    23 +
    (26 +
      (21.448 - century * (46.815 + century * (0.00059 - century * 0.001813))) /
        60) /
      60;
  const obliquity = meanObliquity + 0.00256 * Math.cos(ascendingNode * RAD);
  const declination = Math.asin(
    Math.sin(obliquity * RAD) * Math.sin(apparentLongitude * RAD)
  );

  const obliquityFactor = Math.pow(Math.tan((obliquity / 2) * RAD), 2);
  const equationOfTimeMinutes =
    4 *
    DEG *
    (obliquityFactor * Math.sin(2 * meanLongitude * RAD) -
      2 * eccentricity * Math.sin(meanAnomaly * RAD) +
      4 *
        eccentricity *
        obliquityFactor *
        Math.sin(meanAnomaly * RAD) *
        Math.cos(2 * meanLongitude * RAD) -
      0.5 *
        obliquityFactor *
        obliquityFactor *
        Math.sin(4 * meanLongitude * RAD) -
      1.25 * eccentricity * eccentricity * Math.sin(2 * meanAnomaly * RAD));

  const minutesIntoUtcDay = (((date.getTime() / 60000) % 1440) + 1440) % 1440;
  const trueSolarTime = minutesIntoUtcDay + equationOfTimeMinutes + 4 * lng;
  const hourAngle =
    (((((trueSolarTime / 4 - 180) % 360) + 540) % 360) - 180) * RAD;

  const latitude = lat * RAD;
  const elevation =
    Math.asin(
      Math.max(
        -1,
        Math.min(
          1,
          Math.sin(latitude) * Math.sin(declination) +
            Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle)
        )
      )
    ) * DEG;

  const azimuth =
    (Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(latitude) -
        Math.tan(declination) * Math.cos(latitude)
    ) *
      DEG +
      540) %
    360;

  return { azi: azimuth, ele: elevation + atmosphericRefractionDeg(elevation) };
};

export interface RouteAlignment {
  points: GeoLocation[];
  cumulativeMetres: number[];
  lengthMetres: number;
}

export interface AlignmentPosition extends GeoLocation {
  distanceMetres: number;
  offsetMetres: number;
}

export interface SolarSample extends GeoLocation {
  distanceMetres: number;
  date: Date;
  azi: number;
  ele: number;
  headingDeg: number;
  sunAzimuthRelativeToHeading: number;
}

// Equirectangular holds to under a metre across Hong Kong's extent.
const makeLocalProjection = (referenceLat: number) => {
  const metrePerDegLng = METRE_PER_DEG_LAT * Math.cos(referenceLat * RAD);
  return {
    x: ({ lng }: GeoLocation) => lng * metrePerDegLng,
    y: ({ lat }: GeoLocation) => lat * METRE_PER_DEG_LAT,
    lng: (x: number) => x / metrePerDegLng,
    lat: (y: number) => y / METRE_PER_DEG_LAT,
  };
};

const isSameLocation = (a: GeoLocation, b: GeoLocation) =>
  Math.abs(a.lat - b.lat) < 1e-7 && Math.abs(a.lng - b.lng) < 1e-7;

const metresBetween = (a: GeoLocation, b: GeoLocation) => {
  const project = makeLocalProjection((a.lat + b.lat) / 2);
  return Math.hypot(project.x(a) - project.x(b), project.y(a) - project.y(b));
};

export const flattenRouteGeoJson = (
  geoJson: {
    features?: Array<{
      geometry: {
        type: string;
        coordinates: Array<[number, number]> | Array<Array<[number, number]>>;
      };
    }>;
  } | null
): GeoLocation[] => {
  if (!geoJson?.features?.length) return [];

  const parts: GeoLocation[][] = [];
  geoJson.features.forEach(({ geometry }) => {
    const toPart = (coordinates: Array<[number, number]>) =>
      coordinates.map(([lng, lat]) => ({ lat, lng }));
    if (geometry.type === "MultiLineString") {
      (geometry.coordinates as Array<Array<[number, number]>>).forEach(
        (coordinates) => parts.push(toPart(coordinates))
      );
    } else if (geometry.type === "LineString") {
      parts.push(toPart(geometry.coordinates as Array<[number, number]>));
    }
  });

  // route-waypoints stores MultiLineString parts head-to-tail in travel order.
  const points: GeoLocation[] = [];
  parts.forEach((rawPart) => {
    if (rawPart.length === 0) return;
    let part = rawPart;
    const tail = points[points.length - 1];
    if (tail !== undefined) {
      if (
        metresBetween(tail, part[part.length - 1]) <
        metresBetween(tail, part[0])
      ) {
        part = part.slice().reverse();
      }
      if (isSameLocation(tail, part[0])) part = part.slice(1);
    }
    points.push(...part);
  });

  return points;
};

export const buildRouteAlignment = (points: GeoLocation[]): RouteAlignment => {
  const cumulativeMetres = new Array<number>(points.length);
  let total = 0;
  points.forEach((point, i) => {
    if (i > 0) total += metresBetween(points[i - 1], point);
    cumulativeMetres[i] = total;
  });
  return { points, cumulativeMetres, lengthMetres: total };
};

export const locationAtDistance = (
  { points, cumulativeMetres, lengthMetres }: RouteAlignment,
  distanceMetres: number
): GeoLocation => {
  if (points.length === 0) return { lat: 0, lng: 0 };
  const target = Math.min(Math.max(distanceMetres, 0), lengthMetres);
  let before = 0;
  let after = points.length - 1;
  while (before < after - 1) {
    const mid = (before + after) >> 1;
    if (cumulativeMetres[mid] <= target) before = mid;
    else after = mid;
  }
  const span = cumulativeMetres[after] - cumulativeMetres[before];
  const fraction = span > 0 ? (target - cumulativeMetres[before]) / span : 0;
  return {
    lat:
      points[before].lat + (points[after].lat - points[before].lat) * fraction,
    lng:
      points[before].lng + (points[after].lng - points[before].lng) * fraction,
  };
};

interface AlignmentIndex {
  x: Float64Array;
  y: Float64Array;
  metrePerDegLng: number;
  originX: number;
  originY: number;
  columns: number;
  segmentsByCell: Map<number, number[]>;
}

const alignmentIndexes = new WeakMap<RouteAlignment, AlignmentIndex>();

const getAlignmentIndex = ({ points }: RouteAlignment, key: RouteAlignment) => {
  const cached = alignmentIndexes.get(key);
  if (cached) return cached;

  const metrePerDegLng =
    METRE_PER_DEG_LAT *
    Math.cos((points.length ? points[points.length >> 1].lat : 0) * RAD);
  const x = new Float64Array(points.length);
  const y = new Float64Array(points.length);
  let originX = Infinity;
  let originY = Infinity;
  let farthestX = -Infinity;
  points.forEach((point, i) => {
    x[i] = point.lng * metrePerDegLng;
    y[i] = point.lat * METRE_PER_DEG_LAT;
    if (x[i] < originX) originX = x[i];
    if (y[i] < originY) originY = y[i];
    if (x[i] > farthestX) farthestX = x[i];
  });

  const columns = points.length
    ? Math.floor((farthestX - originX) / SEARCH_CELL_METRES) + 2
    : 1;
  const segmentsByCell = new Map<number, number[]>();
  for (let i = 0; i + 1 < points.length; i += 1) {
    const firstColumn = Math.floor(
      (Math.min(x[i], x[i + 1]) - originX) / SEARCH_CELL_METRES
    );
    const lastColumn = Math.floor(
      (Math.max(x[i], x[i + 1]) - originX) / SEARCH_CELL_METRES
    );
    const firstRow = Math.floor(
      (Math.min(y[i], y[i + 1]) - originY) / SEARCH_CELL_METRES
    );
    const lastRow = Math.floor(
      (Math.max(y[i], y[i + 1]) - originY) / SEARCH_CELL_METRES
    );
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      for (let row = firstRow; row <= lastRow; row += 1) {
        const cell = row * columns + column;
        const bucket = segmentsByCell.get(cell);
        if (bucket) bucket.push(i);
        else segmentsByCell.set(cell, [i]);
      }
    }
  }

  const index = {
    x,
    y,
    metrePerDegLng,
    originX,
    originY,
    columns,
    segmentsByCell,
  };
  alignmentIndexes.set(key, index);
  return index;
};

export const findClosestApproaches = (
  alignment: RouteAlignment,
  target: GeoLocation,
  {
    maxOffsetMetres = 200,
    minSeparationMetres = 150,
  }: { maxOffsetMetres?: number; minSeparationMetres?: number } = {}
): AlignmentPosition[] => {
  const { points, cumulativeMetres } = alignment;
  if (points.length < 2) return [];

  const index = getAlignmentIndex(alignment, alignment);
  const { x, y, metrePerDegLng, originX, originY, columns } = index;
  const targetX = target.lng * metrePerDegLng;
  const targetY = target.lat * METRE_PER_DEG_LAT;

  const approachAt = (i: number): AlignmentPosition => {
    const spanX = x[i + 1] - x[i];
    const spanY = y[i + 1] - y[i];
    const spanSquared = spanX * spanX + spanY * spanY;
    const fraction =
      spanSquared === 0
        ? 0
        : Math.min(
            1,
            Math.max(
              0,
              ((targetX - x[i]) * spanX + (targetY - y[i]) * spanY) /
                spanSquared
            )
          );
    const nearestX = x[i] + spanX * fraction;
    const nearestY = y[i] + spanY * fraction;
    return {
      offsetMetres: Math.hypot(targetX - nearestX, targetY - nearestY),
      distanceMetres:
        cumulativeMetres[i] +
        (cumulativeMetres[i + 1] - cumulativeMetres[i]) * fraction,
      lat: nearestY / METRE_PER_DEG_LAT,
      lng: nearestX / metrePerDegLng,
    };
  };

  const segmentsWithin = (radius: number) => {
    const firstColumn = Math.floor(
      (targetX - radius - originX) / SEARCH_CELL_METRES
    );
    const lastColumn = Math.floor(
      (targetX + radius - originX) / SEARCH_CELL_METRES
    );
    const firstRow = Math.floor(
      (targetY - radius - originY) / SEARCH_CELL_METRES
    );
    const lastRow = Math.floor(
      (targetY + radius - originY) / SEARCH_CELL_METRES
    );
    const found: number[] = [];
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      for (let row = firstRow; row <= lastRow; row += 1) {
        const bucket = index.segmentsByCell.get(row * columns + column);
        if (bucket)
          for (let i = 0; i < bucket.length; i += 1) found.push(bucket[i]);
      }
    }
    return found.sort((a, b) => a - b);
  };

  const nearestOffsetAmong = (segments: number[]) =>
    segments.reduce(
      (best, segment) => Math.min(best, approachAt(segment).offsetMetres),
      Infinity
    );

  let radius = Math.max(maxOffsetMetres, SEARCH_CELL_METRES);
  let nearby = segmentsWithin(radius);
  while (nearby.length === 0 && radius < MAX_SEARCH_RADIUS_METRES) {
    radius *= 4;
    nearby = segmentsWithin(radius);
  }
  if (nearby.length === 0) {
    nearby = points.slice(0, -1).map((_, i) => i);
  }

  let bandMetres = Math.max(maxOffsetMetres, nearestOffsetAmong(nearby));
  while (bandMetres > radius && radius < MAX_SEARCH_RADIUS_METRES) {
    radius = bandMetres;
    nearby = segmentsWithin(radius);
    bandMetres = Math.max(maxOffsetMetres, nearestOffsetAmong(nearby));
  }

  const passes: AlignmentPosition[] = [];
  let currentPass: AlignmentPosition | null = null;
  let previousSegment = -2;
  nearby.forEach((segment) => {
    if (segment === previousSegment) return;
    const approach = approachAt(segment);
    if (segment > previousSegment + 1) {
      if (currentPass) passes.push(currentPass);
      currentPass = approach;
    } else if (
      currentPass &&
      approach.offsetMetres < currentPass.offsetMetres
    ) {
      currentPass = approach;
    }
    previousSegment = segment;
  });
  if (currentPass) passes.push(currentPass);

  const nearest = passes.reduce(
    (best, pass) => (pass.offsetMetres < best.offsetMetres ? pass : best),
    passes[0]
  );

  const approaches: AlignmentPosition[] = [];
  passes
    .filter(
      ({ offsetMetres }) =>
        offsetMetres <= Math.max(maxOffsetMetres, nearest.offsetMetres)
    )
    .forEach((approach) => {
      const previous = approaches[approaches.length - 1];
      if (
        previous &&
        approach.distanceMetres - previous.distanceMetres < minSeparationMetres
      ) {
        if (approach.offsetMetres < previous.offsetMetres) {
          approaches[approaches.length - 1] = approach;
        }
        return;
      }
      approaches.push(approach);
    });

  return approaches.length > 0 ? approaches : [nearest];
};

export const snapStopSequenceToAlignment = (
  alignment: RouteAlignment,
  stops: GeoLocation[],
  options?: { maxOffsetMetres?: number; minSeparationMetres?: number }
): AlignmentPosition[] => {
  if (alignment.points.length === 0 || stops.length === 0) return [];

  const layers = stops.map((stop) =>
    findClosestApproaches(alignment, stop, options)
  );

  const bestCost: number[][] = [];
  const cameFrom: number[][] = [];

  layers.forEach((layer, stopIndex) => {
    const costs = layer.map(({ offsetMetres }) => offsetMetres * offsetMetres);
    if (stopIndex === 0) {
      bestCost.push(costs);
      cameFrom.push(layer.map(() => -1));
      return;
    }

    const previousCosts = bestCost[stopIndex - 1];
    const previousLayer = layers[stopIndex - 1];
    const predecessors = layer.map(() => -1);
    let scanned = 0;
    let runningBestCost = Infinity;
    let runningBestIndex = -1;

    layer.forEach((approach, index) => {
      while (
        scanned < previousLayer.length &&
        previousLayer[scanned].distanceMetres <= approach.distanceMetres
      ) {
        if (previousCosts[scanned] < runningBestCost) {
          runningBestCost = previousCosts[scanned];
          runningBestIndex = scanned;
        }
        scanned += 1;
      }
      costs[index] += runningBestCost;
      predecessors[index] = runningBestIndex;
    });

    if (costs.every((cost) => !Number.isFinite(cost))) {
      let fallback = 0;
      previousCosts.forEach((cost, index) => {
        if (cost < previousCosts[fallback]) fallback = index;
      });
      layer.forEach((approach, index) => {
        costs[index] =
          previousCosts[fallback] +
          approach.offsetMetres * approach.offsetMetres;
        predecessors[index] = fallback;
      });
    }

    bestCost.push(costs);
    cameFrom.push(predecessors);
  });

  const snapped = new Array<AlignmentPosition>(stops.length);
  const finalCosts = bestCost[bestCost.length - 1];
  let chosen = 0;
  finalCosts.forEach((cost, index) => {
    if (cost < finalCosts[chosen]) chosen = index;
  });
  for (let i = stops.length - 1; i >= 0; i -= 1) {
    snapped[i] = layers[i][chosen];
    chosen = cameFrom[i][chosen] >= 0 ? cameFrom[i][chosen] : 0;
  }

  for (let i = 1; i < snapped.length; i += 1) {
    if (snapped[i].distanceMetres < snapped[i - 1].distanceMetres) {
      snapped[i] = {
        ...snapped[i],
        distanceMetres: snapped[i - 1].distanceMetres,
      };
    }
  }

  return snapped;
};

export const sliceAlignment = (
  alignment: RouteAlignment,
  fromMetres: number,
  toMetres: number
): GeoLocation[] => {
  const start = Math.min(fromMetres, toMetres);
  const end = Math.max(fromMetres, toMetres);
  return [
    locationAtDistance(alignment, start),
    ...alignment.points.filter(
      (_, i) =>
        alignment.cumulativeMetres[i] > start &&
        alignment.cumulativeMetres[i] < end
    ),
    locationAtDistance(alignment, end),
  ];
};

export const resampleAlignment = (
  alignment: RouteAlignment,
  count: number,
  fromMetres = 0,
  toMetres = alignment.lengthMetres
): Array<GeoLocation & { distanceMetres: number }> => {
  if (count < 1) return [];
  if (count === 1) {
    return [
      {
        ...locationAtDistance(alignment, fromMetres),
        distanceMetres: fromMetres,
      },
    ];
  }
  const step = (toMetres - fromMetres) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const distanceMetres = fromMetres + step * i;
    return { ...locationAtDistance(alignment, distanceMetres), distanceMetres };
  });
};

export const getBearingDeg = (from: GeoLocation, to: GeoLocation) => {
  const y = Math.sin((to.lng - from.lng) * RAD) * Math.cos(to.lat * RAD);
  const x =
    Math.cos(from.lat * RAD) * Math.sin(to.lat * RAD) -
    Math.sin(from.lat * RAD) *
      Math.cos(to.lat * RAD) *
      Math.cos((to.lng - from.lng) * RAD);
  return (Math.atan2(y, x) * DEG + 360) % 360;
};

export const getSolarProfile = (
  alignment: RouteAlignment,
  {
    startTime = new Date(),
    durationMs = 0,
    count = 200,
    fromMetres = 0,
    toMetres = alignment.lengthMetres,
  }: {
    startTime?: Date;
    durationMs?: number;
    count?: number;
    fromMetres?: number;
    toMetres?: number;
  } = {}
): SolarSample[] => {
  const samples = resampleAlignment(alignment, count, fromMetres, toMetres);
  return samples.map((location, i) => {
    const date = new Date(
      startTime.getTime() +
        (samples.length > 1 ? (durationMs * i) / (samples.length - 1) : 0)
    );
    const { azi, ele } = getSolarPosition(date, location);
    const before = samples[Math.max(0, i - 1)];
    const after = samples[Math.min(samples.length - 1, i + 1)];
    const headingDeg = isSameLocation(before, after)
      ? 0
      : getBearingDeg(before, after);
    return {
      ...location,
      date,
      azi,
      ele,
      headingDeg,
      sunAzimuthRelativeToHeading:
        ((((azi - headingDeg) % 360) + 540) % 360) - 180,
    };
  });
};

export const getSideExposure = (
  {
    sunAzimuthRelativeToHeading,
    ele,
  }: Pick<SolarSample, "sunAzimuthRelativeToHeading" | "ele">,
  side: "left" | "right"
): number => {
  if (ele <= 0) return 0;
  const facingSun =
    side === "left"
      ? -Math.sin(sunAzimuthRelativeToHeading * RAD)
      : Math.sin(sunAzimuthRelativeToHeading * RAD);
  return (
    Math.max(0, facingSun) *
    Math.cos(ele * RAD) *
    Math.min(1, ele / HORIZON_EXTINCTION_LIMIT_DEG)
  );
};

export const unwrapAngles = (angles: number[]): number[] => {
  let offset = 0;
  return angles.map((angle, i) => {
    if (i > 0) {
      const delta = angle - angles[i - 1];
      if (delta > 180) offset -= 360;
      else if (delta < -180) offset += 360;
    }
    return angle + offset;
  });
};
