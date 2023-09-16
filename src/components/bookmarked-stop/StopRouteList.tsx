import { List } from "@mui/material";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../AppContext";
import { routeSortFunc } from "../../utils";
import { TRANSPORT_ORDER } from "../../constants";

const StopRouteList = ({ stops }) => {
  const {
    db: { routeList },
    busSortOrder,
  } = useContext(AppContext);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (stops === undefined) {
      setRoutes([]);
      return;
    }
    let _routes = [];
    Object.entries(routeList)
      .sort((a, b) => routeSortFunc(a, b, TRANSPORT_ORDER[busSortOrder]))
      .forEach(([key, route]) => {
        stops.some(([co, stopId]) => {
          if (route.stops[co] && route.stops[co].includes(stopId)) {
            _routes.push(key + "/" + route.stops[co].indexOf(stopId));
            return true;
          }
          return false;
        });
      });
    setRoutes(_routes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);

  return (
    <List>
      {routes.map((route) => (
        <SuccinctTimeReport key={route} routeId={route} />
      ))}
    </List>
  );
};

export default StopRouteList;
