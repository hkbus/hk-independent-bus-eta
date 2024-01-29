import React from "react";
import { SxProps, Theme, Typography } from "@mui/material";

interface RouteNoProps {
  routeNo: string;
  component?: any;
  align?: "right" | "left" | "inherit" | "center" | "justify";
}

const RouteNo = ({ routeNo, component, align }: RouteNoProps) => {
  // Suffix Examples: 962X=> X, 44A1 => A1, 25MS => MS, AEL => "", NA29 => ""
  const suffixMatch = routeNo.match(/(?<=[0-9])[A-Z]+[0-9]*$/);
  const suffixLength = suffixMatch !== null && suffixMatch[0].length;
  const [prefix, suffix] =
    suffixMatch !== null
      ? [routeNo.slice(0, -suffixLength), routeNo.slice(-suffixLength)]
      : [routeNo, ""];
  return (
    <Typography
      // @ts-ignore
      component={component || "h2"}
      align={align}
      variant="caption"
      color="textPrimary"
      sx={rootSx}
    >
      <span>{prefix}</span>
      <span>{suffix}</span>
    </Typography>
  );
};

export default RouteNo;

const rootSx: SxProps<Theme> = {
  lineHeight: "normal",
  display: "inline",
  "& > span:nth-of-type(1)": {
    fontSize: "1.5rem",
    fontFamily: '"Oswald", sans-serif',
  },
  "& > span:nth-of-type(2)": {
    fontSize: "1.2rem",
    fontFamily: '"Oswald", sans-serif',
  },
};
