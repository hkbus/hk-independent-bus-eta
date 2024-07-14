import { Box, CircularProgress, List, SxProps, Theme } from "@mui/material";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { getStopGroup } from "../../stopGroup";
import { useStopEtas } from "../../hooks/useStopEtas";
import { Company } from "hk-bus-eta";
import DbContext from "../../context/DbContext";
import { useContext, useMemo } from "react";

interface StopRouteListProps {
  stops: Array<[Company, string]>; // [[co, stopId]]
  routeId : string | undefined;
  isFocus: boolean;
}

const StopRouteList = ({ stops, routeId = undefined, isFocus }: StopRouteListProps) => {
  const { db: { routeList, stopList } } = useContext(DbContext);
  const stopGroup = useMemo(
    () => getStopGroup({ routeList, stopList, stopKeys: stops, routeId }),
    [routeList, stopList, stops, routeId]
  );
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
