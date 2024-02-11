import { CircularProgress, List, Box } from "@mui/material";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { useStopEtas } from "../../hooks/useStopEtas";

interface StopRouteListProps {
  stops: string[][]; // [[co, stopId]]
  isFocus: boolean;
}

const StopRouteList = ({ stops, isFocus }: StopRouteListProps) => {
  const stopEtas = useStopEtas({ stopKeys: stops, disabled: !isFocus });

  if (stopEtas.length === 0) {
    return (
      <Box textAlign="center">
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
