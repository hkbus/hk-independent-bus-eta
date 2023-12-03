import { Box, Divider, List, SxProps, Theme, Typography } from "@mui/material";
import SuccinctTimeReport from "./SuccinctTimeReport";
import { useMemo, useState } from "react";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

interface HomeRouteListDropDownProps {
  name: string;
  routeStrings: string;
  defaultExpanded?: boolean;
}

const HomeRouteListDropDown = ({
  name,
  routeStrings,
  defaultExpanded = true,
}: HomeRouteListDropDownProps) => {
  const [expaned, setExpanded] = useState<boolean>(defaultExpanded);
  const routes = useMemo(
    () => routeStrings.split("|").filter((v) => v) ?? [],
    [routeStrings]
  );
  if (routes.length === 0) {
    return <></>;
  }
  return (
    <Box>
      <Box sx={headerSx} onClick={() => setExpanded((prev) => !prev)}>
        <Typography variant="body1" m={1} fontWeight={700}>
          {name}
        </Typography>
        <Box>{!expaned ? <ExpandMoreIcon /> : <ExpandLessIcon />}</Box>
      </Box>
      <Divider />
      {expaned && (
        <List disablePadding>
          {routes.map(
            (selectedRoute, idx) =>
              Boolean(selectedRoute) && (
                <SuccinctTimeReport
                  key={`route-${name}-${idx}`}
                  routeId={selectedRoute}
                />
              )
          )}
        </List>
      )}
      <Divider />
    </Box>
  );
};

export default HomeRouteListDropDown;

const headerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mx: 1,
  cursor: "pointer",
};
