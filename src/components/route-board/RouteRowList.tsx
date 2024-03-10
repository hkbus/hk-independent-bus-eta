import React, { useCallback, useContext } from "react";
import { areEqual } from "react-window";
import { vibrate } from "../../utils";
import RouteRow from "./RouteRow";
import { RouteListEntry } from "hk-bus-eta";
import AppContext from "../../AppContext";
import { useNavigate } from "react-router-dom";
import useLanguage from "../../hooks/useTranslation";

interface RouteRowListProps {
  data: {
    routeList: [string, RouteListEntry][];
    vibrateDuration: number;
    tab: "recent" | "all" | "bus" | "minibus" | "lightRail" | "mtr";
  };
  index: number;
  style: React.CSSProperties | null;
}

const RouteRowList = React.memo(
  ({
    data: { routeList, vibrateDuration, tab },
    index,
    style,
  }: RouteRowListProps) => {
    const route = routeList[index];
    const { addSearchHistory, removeSearchHistoryByRouteId } =
      useContext(AppContext);
    const language = useLanguage();
    const navigate = useNavigate();

    const handleClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      addSearchHistory(route[0]);
      setTimeout(() => {
        navigate(`/${language}/route/${route[0].toLowerCase()}`);
      }, 0);
    }, [vibrate, vibrateDuration, addSearchHistory, route[0], navigate, language]);

    const handleRemove = (e: React.MouseEvent) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      removeSearchHistoryByRouteId(route[0]);
    };

    return (
      <RouteRow
        onClick={handleClick}
        route={route}
        style={style ?? {}}
        onRemove={tab === "recent" ? handleRemove : undefined}
      />
    );
  },
  areEqual
);

export default RouteRowList;
