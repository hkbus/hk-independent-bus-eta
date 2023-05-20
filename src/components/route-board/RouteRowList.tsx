import React, { useContext } from "react";
import { areEqual } from "react-window";
import { vibrate } from "../../utils";
import RouteRow from "./RouteRow";
import { RouteListEntry } from "hk-bus-eta";
import AppContext from "../../AppContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface RouteRowListProps {
  data: {
    routeList: [string, RouteListEntry][];
    vibrateDuration: number;
    tab: "recent" | "all" | "bus" | "minibus" | "lightRail" | "mtr";
  };
  index: number;
  style: React.CSSProperties;
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
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const handleClick = (e) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      addSearchHistory(route[0]);
      setTimeout(() => {
        navigate(`/${i18n.language}/route/${route[0].toLowerCase()}`);
      }, 0);
    };

    const handleRemove = (e) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      removeSearchHistoryByRouteId(route[0]);
    };

    return (
      <RouteRow
        handleClick={handleClick}
        route={route}
        style={style}
        onRemove={tab === "recent" ? handleRemove : null}
      />
    );
  },
  areEqual
);

export default RouteRowList;
