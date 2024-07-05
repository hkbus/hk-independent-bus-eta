import { Box, CircularProgress, List, SxProps, Theme } from "@mui/material";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { useStopGroup } from "../../hooks/useStopGroup";
import { useStopEtas } from "../../hooks/useStopEtas";
import { Company } from "hk-bus-eta";

interface StopRouteListProps {
  stops: Array<[Company, string]>; // [[co, stopId]]
  routeId : string | undefined;
  isFocus: boolean;
}

const StopRouteList = ({ stops, routeId = undefined, isFocus }: StopRouteListProps) => {
  const stopGroup = useStopGroup({ stopKeys: stops, routeId : routeId });
  const stopEtas = useStopEtas({ stopKeys: stopGroup, disabled: !isFocus });

  if (stopEtas.length === 0) {
    return (
      <Box sx={loadingContainerSx}>
        <CircularProgress sx={{ my: 5 }} />
      </Box>
    );
  }

  return (
    <List>
      {stopEtas.map(([route, etas]) => (
        <SuccinctTimeReport key={route} routeId={route} etas={etas} />
      ))}
    </List>
  );
};

export default StopRouteList;

const loadingContainerSx: SxProps<Theme> = {
  display: "flex",
  flex: 1,
  justifyContent: "center",
};
