import { List } from "@mui/material";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { useStopEtas } from "../../hooks/useStopEtas";

interface StopRouteListProps {
  stops: string[][]; // [[co, stopId]]
}

const StopRouteList = ({ stops }: StopRouteListProps) => {
  const stopEtas = useStopEtas(stops);

  return (
    <List>
      {stopEtas.map(([route, etas]) => (
        <SuccinctTimeReport key={route} routeId={route} etas={etas} />
      ))}
    </List>
  );
};

export default StopRouteList;
