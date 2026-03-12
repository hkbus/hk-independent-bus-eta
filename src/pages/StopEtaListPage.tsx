import { useParams } from "react-router-dom";
import StopRouteList from "../components/bookmarked-stop/StopRouteList";
import { useContext, useMemo } from "react";
import DbContext from "../context/DbContext";
import { Box } from "@mui/material";
import { StopTuple } from "hk-bus-eta";

const StopEtaListPage = () => {
  const { stopId } = useParams();
  const {
    db: { routeList, stopMap },
  } = useContext(DbContext);

  const stops = useMemo(() => {
    if (!stopId) return [];
    let ret: StopTuple[] = [];
    Object.values(routeList).forEach(({stops}) => {
      let idx = -1
      Object.entries(stops).forEach(([co, stopIds]) => {
        idx = Math.max(stopIds.findIndex((_stopId) => stopId === _stopId))
        if (idx !== -1 && ret.length === 0) {
          ret = [[co, stopIds[idx]]].concat(stopMap[stopIds[idx]] ?? []) as StopTuple[]
        }
      })
    })
    
    return ret;
  }, [routeList, stopId, stopMap]);

  console.log(stops)

  return (
    <Box height="100%" overflow="scroll">
      <StopRouteList stops={stops} isFocus={true} />
    </Box>
  );
};

export default StopEtaListPage;
