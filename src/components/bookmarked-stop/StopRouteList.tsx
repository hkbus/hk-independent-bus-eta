import { Box, CircularProgress, List, SxProps, Theme } from "@mui/material";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { useStopEtas } from "../../hooks/useStopEtas";
import { Company } from "hk-bus-eta";

interface StopRouteListProps {
  stops: Array<[Company, string]>; // [[co, stopId]]
  isFocus: boolean;
}

const StopRouteList = ({ stops, isFocus }: StopRouteListProps) => {
  const stopEtas = useStopEtas({ stopKeys: stops, disabled: !isFocus });

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
