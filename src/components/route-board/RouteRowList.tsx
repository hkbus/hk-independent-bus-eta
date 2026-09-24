import React, { useCallback, useContext } from "react";
import type { RowComponentProps } from "react-window";
import { vibrate } from "../../utils";
import RouteRow from "./RouteRow";
import { RouteListEntry } from "hk-bus-eta";
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import useLanguage from "../../hooks/useTranslation";

interface RouteRowListRowProps {
  routeList: [string, RouteListEntry][];
  vibrateDuration: number;
  tab: "recent" | "all" | "bus" | "minibus" | "lightRail" | "mtr";
}

type RouteRowListProps = RowComponentProps<RouteRowListRowProps>;

const RouteRowListMemo = React.memo(
  ({ routeList, vibrateDuration, tab, index, style }: RouteRowListProps) => {
    const route = routeList[index];
    const { addSearchHistory, removeSearchHistoryByRouteId } =
      useContext(AppContext);
    const language = useLanguage();
    const navigate = useNavigate();

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        vibrate(vibrateDuration);
        addSearchHistory(route[0]);
        setTimeout(() => {
          navigate(`/${language}/route/${route[0].toLowerCase()}`);
        }, 0);
      },
      [vibrateDuration, addSearchHistory, route, navigate, language]
    );

    const handleRemove = (e: React.MouseEvent) => {
      e.preventDefault();
      vibrate(vibrateDuration);
      removeSearchHistoryByRouteId(route[0]);
    };

    return (
      <RouteRow
        onClick={handleClick}
        route={route}
        style={style}
        onRemove={tab === "recent" ? handleRemove : undefined}
      />
    );
  }
);

// react-window's `rowComponent` prop requires a plain function returning
// ReactElement | null; React.memo()'s type erases to ReactNode, so this
// thin wrapper is what's passed to List -- RouteRowListMemo underneath
// still skips re-renders on unchanged props.
const RouteRowList = (props: RouteRowListProps): React.ReactElement => (
  <RouteRowListMemo {...props} />
);

export default RouteRowList;
