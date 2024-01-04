import React, {
  useCallback,
  useContext,
  useImperativeHandle,
  useRef,
} from "react";
import SwipeableViews from "react-swipeable-views";
import AppContext from "../../AppContext";
import type { HomeTabType } from "./HomeTabbar";
import SearchRangeController from "./SearchRangeController";
import NearbyRouteList from "./lists/NearbyRouteList";
import SavedRouteList from "./lists/SavedRouteList";
import SmartCollectionRouteList from "./lists/SmartCollectionRouteList";
import CollectionRouteList from "./lists/CollectionRouteList";

interface SwipeableListProps {
  homeTab: HomeTabType;
  onChangeTab: (v: string) => void;
}

interface SwipeableListRef {
  changeTab: (v: HomeTabType) => void;
}

const SwipeableList = React.forwardRef<SwipeableListRef, SwipeableListProps>(
  ({ homeTab, onChangeTab }, ref) => {
    const { collections } = useContext(AppContext);

    const defaultHometab = useRef(homeTab);

    useImperativeHandle(ref, () => ({
      changeTab: (v) => {
        defaultHometab.current = v;
      },
    }));

    const getViewIdx = useCallback(() => {
      let ret = HOME_TAB.indexOf(defaultHometab.current);
      if (ret !== -1) return ret;
      for (let i = 0; i < collections.length; ++i) {
        if (collections[i].name === defaultHometab.current) {
          return i + HOME_TAB.length;
        }
      }
      return -1;
    }, [collections]);

    return (
      <>
        {/* SwipeableViews has overflow attribute child div and this preventing <SearchRangeControl/> fixed on top using `position: sticky` */}
        {homeTab === "nearby" ? <SearchRangeController /> : null}
        <SwipeableViews
          index={getViewIdx()}
          onChangeIndex={(idx) => {
            onChangeTab(
              idx < HOME_TAB.length
                ? HOME_TAB[idx]
                : collections[idx - HOME_TAB.length].name
            );
          }}
        >
          <NearbyRouteList isFocus={homeTab === "nearby"} />
          <SavedRouteList isFocus={homeTab === "saved"} />
          <SmartCollectionRouteList isFocus={homeTab === "collections"} />
          {collections.map((collection) => (
            <CollectionRouteList
              key={`list-${collection.name}`}
              collection={collection}
              isFocus={homeTab === collection.name}
            />
          ))}
        </SwipeableViews>
      </>
    );
  }
);

export default SwipeableList;

const HOME_TAB = ["nearby", "saved", "collections"];
