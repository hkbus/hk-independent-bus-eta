import React from "react";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

interface RouteNoProps {
  routeNo: string;
  component?: any;
  align?: "right" | "left" | "inherit" | "center" | "justify";
}

const RouteNo = ({ routeNo, component, align }: RouteNoProps) => {
  const [prefix, suffix] = routeNo.match(/[A-Z]+$/)
    ? [routeNo.slice(0, -1), routeNo.slice(-1)]
    : [routeNo, ""];
  return (
    <RouteNoTypography
      // @ts-ignore
      component={component || "h2"}
      align={align}
      variant="caption"
      color="textPrimary"
      className={classes.root}
    >
      <span className={classes.prefix}>{prefix}</span>
      <span className={classes.suffix}>{suffix}</span>
    </RouteNoTypography>
  );
};

export default RouteNo;

const PREFIX = "routeNo";

const classes = {
  root: `${PREFIX}-root`,
  prefix: `${PREFIX}-prefix`,
  suffix: `${PREFIX}-suffix`,
};

const RouteNoTypography = styled(Typography)(({ theme }) => ({
  [`&.${classes.root}`]: {
    lineHeight: "normal",
    display: "inline",
  },
  [`& .${classes.prefix}`]: {
    fontSize: "1.2rem",
    fontFamily: '"Oswald", sans-serif',
  },
  [`& .${classes.suffix}`]: {
    fontSize: "0.95rem",
    fontFamily: '"Oswald", sans-serif',
  },
}));
