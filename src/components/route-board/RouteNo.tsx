import { SxProps, Theme, Typography } from "@mui/material";
import { useMemo } from "react";

interface RouteNoProps {
  routeNo: string;
  component?: any;
  align?: "right" | "left" | "inherit" | "center" | "justify";
  fontSize?: string;
  // operator line colour, drawn as a short rule under the number
  lineColor?: string;
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

  const sx = useMemo(() => rootSx(fontSize, lineColor), [fontSize, lineColor]);

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

const rootSx = (fontSize?: string, lineColor?: string): SxProps<Theme> => {
  return {
    ...(lineColor
      ? {
          display: "inline-block",
          lineHeight: 1.1,
          borderBottom: `3px solid ${lineColor}`,
          borderRadius: "1px",
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
