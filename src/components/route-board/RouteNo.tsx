import React from "react";
import { SxProps, Theme, Typography } from "@mui/material";

interface RouteNoProps {
  routeNo: string;
  component?: any;
  align?: "right" | "left" | "inherit" | "center" | "justify";
}

const RouteNo = ({ routeNo, component, align }: RouteNoProps) => {
  const [prefix, suffix] = routeNo.match(/[0-9][A-Z]+$/)
    ? [routeNo.slice(0, -1), routeNo.slice(-1)]
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
  "& > span:nth-child(1)": {
    fontSize: "1.5rem",
    fontFamily: '"Oswald", sans-serif',
  },
  "& > span:nth-child(2)": {
    fontSize: "1.2rem",
    fontFamily: '"Oswald", sans-serif',
  },
};
