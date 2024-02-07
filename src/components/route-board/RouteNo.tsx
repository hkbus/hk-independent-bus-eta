import { SxProps, Theme, Typography } from "@mui/material";

interface RouteNoProps {
  routeNo: string;
  component?: any;
  align?: "right" | "left" | "inherit" | "center" | "justify";
}

const RouteNo = ({ routeNo, component, align }: RouteNoProps) => {
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
  "& > span:nth-of-type(1)": {
    fontSize: "1.5rem",
    fontFamily: '"Oswald", sans-serif',
  },
  "& > span:nth-of-type(2)": {
    fontSize: "1.2rem",
    fontFamily: '"Oswald", sans-serif',
  },
};
