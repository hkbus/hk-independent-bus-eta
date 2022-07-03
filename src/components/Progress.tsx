import React from "react";
import {
  LinearProgress as MuiLinearProgress,
  CircularProgress as MuiCircularProgress,
  LinearProgressProps,
  CircularProgressProps,
} from "@mui/material";

export const LinearProgress = React.forwardRef<
  HTMLElement,
  LinearProgressProps
>(({ sx, color, ...props }, ref) => {
  return (
    <MuiLinearProgress
      color={color ?? "inherit"}
      sx={{
        m: 1,
        height: 5,
        borderRadius: 5,
        ...sx,
      }}
      ref={ref}
      {...props}
    />
  );
});

export const CircularProgress = React.forwardRef<
  HTMLElement,
  CircularProgressProps
>(({ sx, color, ...props }, ref) => {
  return (
    <MuiCircularProgress
      color={color ?? "inherit"}
      sx={{
        m: 1,
        ...sx,
      }}
      ref={ref}
      {...props}
    />
  );
});
