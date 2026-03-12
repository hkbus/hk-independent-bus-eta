import { useParams } from "react-router-dom";
import StopRouteList from "../components/bookmarked-stop/StopRouteList";
import { useContext, useMemo } from "react";
import DbContext from "../context/DbContext";
import { Box, Divider, Typography } from "@mui/material";
import { StopTuple } from "hk-bus-eta";
import useLanguage from "../hooks/useTranslation";

const StopEtaListPage = () => {
  const { stopId } = useParams();
  const {
    db: { routeList, stopMap, stopList },
  } = useContext(DbContext);
  const language = useLanguage();

  const stops = useMemo(() => {
    if (!stopId) return [];
    let ret: StopTuple[] = [];
    Object.values(routeList).forEach(({ stops }) => {
      let idx = -1;
      Object.entries(stops).forEach(([co, stopIds]) => {
        idx = Math.max(stopIds.findIndex((_stopId) => stopId === _stopId));
        if (idx !== -1 && ret.length === 0) {
          ret = [[co, stopIds[idx]]].concat(
            stopMap[stopIds[idx]] ?? []
          ) as StopTuple[];
        }
      });
    });

    return ret;
  }, [routeList, stopId, stopMap]);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h6">{stopList[stopId!].name[language]}</Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box overflow="scroll">
        <StopRouteList stops={stops} isFocus={true} />
      </Box>
    </Box>
  );
};

export default StopEtaListPage;
