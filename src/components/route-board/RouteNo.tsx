import { SxProps, Theme, Typography } from "@mui/material";
import { useMemo } from "react";

interface RouteNoProps {
  routeNo: string;
  component?: any;
  align?: "right" | "left" | "inherit" | "center" | "justify";
  fontSize?: string;
  // operator line colour, drawn as a short rule under the number
  lineColor?: string | string[];
}

const RouteNo = ({
  routeNo,
  component,
  align,
  fontSize,
  lineColor,
}: RouteNoProps) => {
  // Suffix Examples: 962X=> X, 44A1 => A1, 25MS => MS, AEL => "", NA29 => ""
  let splitIdx = routeNo.length;
  for (let i = 1; i < routeNo.length; ++i) {
    if (
      "0" <= routeNo[i - 1] &&
      routeNo[i - 1] <= "9" &&
      "A" <= routeNo[i] &&
      routeNo[i] <= "Z"
    ) {
      splitIdx = i;
      break;
    }
  }
  const prefix = routeNo.slice(0, splitIdx);
  const suffix = routeNo.slice(splitIdx);

  const sx = useMemo(
    () => rootSx(fontSize, lineColor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fontSize, String(lineColor)]
  );

  return (
    <Typography
      component={component || "h2"}
      align={align}
      variant="caption"
      color="textPrimary"
      sx={sx}
    >
      <span>{prefix}</span>
      <span>{suffix}</span>
    </Typography>
  );
};

export default RouteNo;

// one colour is solid; joint routes split the rule evenly, one band per operator
const lineGradient = (colors: string | string[]) => {
  const list = [colors].flat();
  const w = 100 / list.length;
  return `linear-gradient(to right, ${list
    .map((c, i) => `${c} ${i * w}% ${(i + 1) * w}%`)
    .join(", ")})`;
};

const rootSx = (
  fontSize?: string,
  lineColor?: string | string[]
): SxProps<Theme> => {
  return {
    ...(lineColor
      ? {
          display: "inline-block",
          lineHeight: 1.1,
          borderBottom: "3px solid transparent",
          borderImage: `${lineGradient(lineColor)} 1`,
        }
      : { display: "inline", lineHeight: "normal" }),
    "& > span:nth-of-type(1)": {
      fontSize: fontSize || "2em",
      fontFamily: '"Oswald", sans-serif',
    },
    "& > span:nth-of-type(2)": {
      fontSize: "1.6em",
      fontFamily: '"Oswald", sans-serif',
    },
    whiteSpace: "nowrap",
  };
};
