import { useParams } from "react-router-dom";
import StopRouteList from "../components/bookmarked-stop/StopRouteList";
import { useContext, useMemo } from "react";
import DbContext from "../context/DbContext";
import { Box } from "@mui/material";

const StopEtaListPage = () => {
  const { stopId } = useParams();
  const {
    db: { stopMap },
  } = useContext(DbContext);

  const stops = useMemo(() => {
    if (!stopId) return [];
    return stopMap[stopId];
  }, [stopId, stopMap]);

  return (
    <Box height="100%" overflow="scroll">
      <StopRouteList stops={stops} isFocus={true} />
    </Box>
  );
};

export default StopEtaListPage;
