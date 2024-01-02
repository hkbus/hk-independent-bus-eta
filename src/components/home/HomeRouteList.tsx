import {
  Accordion,
  Divider,
  List,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import SuccinctTimeReport from "./SuccinctTimeReport";
import { useMemo } from "react";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

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
   const routes = useMemo(
    () => routeStrings.split("|").filter((v) => v) ?? [],
    [routeStrings]
  );
  if (routes.length === 0) {
    return <></>;
  }
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={AccordionSx}
    >
      <AccordionSummary sx={headerSx} expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body1" m={1} fontWeight={700}>
          {name}
        </Typography>
      </AccordionSummary>
      <Divider />
      <AccordionDetails>
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
      </AccordionDetails>
    </Accordion>
  );
};

export default HomeRouteListDropDown;

const AccordionSx: SxProps<Theme> = {
  backgroundColor: "transparent",
};

const headerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mx: 1,
  cursor: "pointer",
};
