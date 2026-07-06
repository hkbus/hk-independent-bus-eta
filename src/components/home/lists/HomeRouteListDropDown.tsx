import { Box, Divider, List, SxProps, Theme, Typography } from "@mui/material";
import SuccinctTimeReport from "../SuccinctTimeReport";
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
        <List disablePadding sx={listSx}>
          {routes.map(
            (selectedRoute, idx) =>
              Boolean(selectedRoute) && (
                // POC (#196 landscape): wrap each row so the row's ListItem +
                // its trailing Divider stay together as ONE grid cell. Without
                // the wrapper the Divider (a sibling emitted by
                // SuccinctTimeReport) would take its own grid cell and break
                // the columns. SuccinctTimeReport itself is untouched.
                <Box key={`route-${name}-${idx}`}>
                  <SuccinctTimeReport routeId={selectedRoute} />
                </Box>
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

// POC (#196 landscape): on wide screens lay the rows out in a responsive grid
// of 2-3 auto-fitted columns. Below `md` no `display: grid` is emitted, so the
// rows stack in a single column exactly as before (mobile is untouched).
const listSx: SxProps<Theme> = {
  display: { md: "grid" },
  gridTemplateColumns: {
    md: "repeat(auto-fill, minmax(340px, 1fr))",
  },
  columnGap: { md: 1 },
};
