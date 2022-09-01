import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { areEqual } from "react-window";
import { useNavigate } from "react-router-dom";
import { vibrate } from "../../utils";
import RouteRow from "./RouteRow";
import { RouteListEntry } from "hk-bus-eta";
import AppContext from "../../AppContext";

interface RouteRowListProps {
  data: {
    routeList: [string, RouteListEntry][];
    vibrateDuration: number;
  };
  index: number;
  style: React.CSSProperties;
}

const RouteRowList = React.memo(
  ({
    data: { routeList, vibrateDuration },
    index,
    style,
  }: RouteRowListProps) => {
    const { i18n } = useTranslation();
    const route = routeList[index];
    const navigate = useNavigate();
    const { addSearchHistory } = useContext(AppContext);

    const handleClick = (e) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      addSearchHistory(route[0]);
      setTimeout(() => {
        navigate(`/${i18n.language}/route/${route[0].toLowerCase()}`);
      }, 0);
    };

    return <RouteRow handleClick={handleClick} route={route} style={style} />;
  },
  areEqual
);

export default RouteRowList;
