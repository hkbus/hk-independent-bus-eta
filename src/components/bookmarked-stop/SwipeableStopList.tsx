import React, {
  useContext,
  useMemo,
  useRef,
  useImperativeHandle,
  useCallback,
} from "react";
import SwipeableViews from "react-swipeable-views";
import StopRouteList from "./StopRouteList";
import { Company } from "hk-bus-eta";
import DbContext from "../../context/DbContext";
import CollectionContext from "../../CollectionContext";

interface SwipeableStopListProps {
  stopTab: string;
  onChangeTab: (v: string) => void;
}

export interface SwipeableStopListRef {
  changeTab: (v: string) => void;
}

const SwipeableStopList = React.forwardRef<
  SwipeableStopListRef,
  SwipeableStopListProps
>(({ stopTab, onChangeTab }, ref) => {
  const { savedStops } = useContext(CollectionContext);
  const {
    db: { stopList, stopMap },
  } = useContext(DbContext);
  const defaultStoptab = useRef<string>(stopTab);

  useImperativeHandle(ref, () => ({
    changeTab: (v: string) => {
      defaultStoptab.current = v;
    },
  }));

  const availableTabs = useMemo(
    () =>
      savedStops.filter((stopId) => {
        return stopId.split("|")[1] in stopList;
      }),
    [savedStops, stopList]
  );

  const getViewIdx = useCallback(() => {
    let ret = availableTabs.indexOf(defaultStoptab.current);
    if (ret !== -1) return ret;
    return -1;
  }, [availableTabs]);

  const tabStops = useMemo(
    () =>
      availableTabs.map((stopTab) => {
        if (stopTab === "") return [];
        const ret = [stopTab.split("|") as [Company, string]];
        stopMap[ret[0][1]]?.forEach((v) => ret.push(v));
        return ret;
      }),
    [availableTabs, stopMap]
  );

  return (
    <SwipeableViews
      index={getViewIdx()}
      onChangeIndex={(idx) => {
        onChangeTab(availableTabs[idx]);
      }}
    >
      {tabStops.map((stops, idx) => (
        <StopRouteList
          key={`savedStops-${idx}`}
          stops={stops}
          routeId={undefined}
          isFocus={getViewIdx() === idx}
        />
      ))}
    </SwipeableViews>
  );
});

export default SwipeableStopList;
