import { Box, type SxProps, type Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SUN_SIDE_THRESHOLD } from "./sunSideStyle";

/**
 * Boils the per-leg figures down to one verdict for the whole ride.
 *
 * Weighted by how far the bus actually travels on each leg, not by
 * stop count — a dozen short hops through a town centre should not
 * outvote one long run down a highway.
 */
export const summariseSunSide = (sides: number[], weights?: number[]) => {
  let left = 0;
  let right = 0;
  let none = 0;
  sides.forEach((side, i) => {
    const w = weights?.[i] ?? 1;
    if (Math.abs(side) < SUN_SIDE_THRESHOLD) none += w;
    else if (side < 0) left += w;
    else right += w;
  });
  const lit = left + right;
  const total = lit + none;
  if (total === 0 || lit / total < 0.25) {
    return { verdict: "neutral" as const, sunOnRight: false };
  }
  const sunOnRight = right >= left;
  const dominance = Math.max(left, right) / lit;
  // Measured against the live route list: only about half of Hong
  // Kong's routes have a side that clearly wins, and roughly a quarter
  // are genuinely split. Naming a side for those would be a coin toss
  // dressed up as advice, so it gets its own answer.
  const verdict =
    dominance >= 0.8 ? "clear" : dominance >= 0.6 ? "mostly" : "even";
  return { verdict, sunOnRight };
};

/**
 * The whole ride in one line, for readers who would rather be told
 * than shown. Reports where the sun is rather than prescribing a seat
 * — some riders are chasing the sun, not avoiding it.
 */
export const SunSideSentence = ({
  sides,
  weights,
}: {
  sides: number[];
  weights?: number[];
}) => {
  const { t } = useTranslation();
  const { verdict, sunOnRight } = summariseSunSide(sides, weights);
  if (verdict === "neutral") {
    return <Box sx={hintSx}>{t("太陽當空，兩邊差不多")}</Box>;
  }
  if (verdict === "even") {
    return <Box sx={hintSx}>{t("兩邊都會曬，冇邊邊特別好")}</Box>;
  }
  return (
    <Box sx={hintSx}>
      {`${t("太陽大部分時間喺")}${sunOnRight ? t("右") : t("左")}${t("邊")}${
        verdict === "mostly" ? t("（中途會轉邊）") : ""
      }`}
    </Box>
  );
};

/**
 * Stands in after dark. Says when the display will next mean
 * something, rather than leaving a blank that reads as a fault.
 */
export const SunAsleepNote = ({ sunriseAt }: { sunriseAt: Date | null }) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ ...(hintSx as object), ...(quietSx as object) }}>
      {t("太陽已下山")}
      {sunriseAt !== null &&
        ` · ${t("日出")} ${sunriseAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`}
    </Box>
  );
};

const hintSx: SxProps<Theme> = {
  px: 1.5,
  py: 1,
  fontSize: "0.8rem",
  fontWeight: 600,
  textAlign: "center",
  lineHeight: 1.4,
};

const quietSx: SxProps<Theme> = {
  fontWeight: 400,
  opacity: 0.75,
};
