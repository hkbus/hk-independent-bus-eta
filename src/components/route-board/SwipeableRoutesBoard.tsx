import React, { useContext, useMemo, useCallback } from "react";
import SwipeableViews from "react-swipeable-views";
import { virtualize, bindKeyboard } from "react-swipeable-views-utils";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import memorize from "memoize-one";
import { useTranslation } from "react-i18next";
import { Box, SxProps, Theme, Typography } from "@mui/material";

import AppContext from "../../AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";
import type { BoardTabType } from "../../typing";
import { TRANSPORT_SEARCH_OPTIONS, TRANSPORT_ORDER } from "../../constants";
import RouteRowList from "./RouteRowList";
import { routeSortFunc } from "../../utils";

interface SwipeableRouteBoardProps {
  boardTab: BoardTabType;
  onChangeTab: (v: string) => void;
}

const SwipeableRoutesBoard = ({
  boardTab,
  onChangeTab,
}: SwipeableRouteBoardProps) => {
  const {
    searchRoute,
    db: { holidays, routeList },
    isRouteFilter,
    busSortOrder,
    routeSearchHistory,
    vibrateDuration,
    isRecentSearchShown,
  } = useContext(AppContext);
  const isTodayHoliday = useMemo(
    () => isHoliday(holidays, new Date()),
    [holidays]
  );
  const { t } = useTranslation();

  const coItemDataList = useMemo(() => {
    const baseRouteList = Object.entries(routeList)
      // filter by route no
      .filter(
        ([routeNo, { stops, co }]) =>
          routeNo.startsWith(searchRoute.toUpperCase()) &&
          (stops[co[0]] == null || stops[co[0]].length > 0)
      )
      // filter non available route
      .filter(
        ([routeNo, { freq }]) =>
          !isRouteFilter || isRouteAvaliable(routeNo, freq, isTodayHoliday)
      )
      .sort((a, b) => routeSortFunc(a, b, TRANSPORT_ORDER[busSortOrder]));
    return Object.entries(TRANSPORT_SEARCH_OPTIONS)
      .filter(([key]) => isRecentSearchShown || key !== "recent")
      .map(([tab, searchOptions], idx) => {
        return createItemData(
          tab === "recent"
            ? routeSearchHistory
                .filter((routeNo) =>
                  routeNo.startsWith(searchRoute.toUpperCase())
                )
                .filter((routeNo) => routeList[routeNo])
                .map((routeNo) => [routeNo, routeList[routeNo]])
            : baseRouteList.filter(([routeNo, { co }]) =>
                co.some((c) => searchOptions.includes(c))
              ),
          vibrateDuration,
          tab
        );
      });
  }, [
    routeList,
    isTodayHoliday,
    searchRoute,
    isRouteFilter,
    vibrateDuration,
    busSortOrder,
    routeSearchHistory,
    isRecentSearchShown,
  ]);

  const itemHeight = useMemo(() => {
    const baseFontSize = parseInt(getComputedStyle(document.body).fontSize, 10);
    if (baseFontSize <= 18) {
      return 64;
    } else if (baseFontSize <= 22) {
      return 78;
    } else if (baseFontSize <= 26) {
      return 92;
    } else if (baseFontSize <= 30) {
      return 98;
    }
    return 110;
  }, []);

  const ListRenderer = useCallback(
    ({ key, index }) => (
      <React.Fragment key={key}>
        {coItemDataList[index].routeList.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                height={height * 0.98}
                itemCount={coItemDataList[index].routeList.length}
                itemSize={itemHeight}
                width={width}
                itemData={coItemDataList[index]}
              >
                {RouteRowList}
              </FixedSizeList>
            )}
          </AutoSizer>
        ) : (
          <Box sx={noResultSx}>
            <SentimentVeryDissatisfiedIcon fontSize="small" />
            <Box>
              {index > 0 ? (
                <>
                  <Typography variant="h6">"{searchRoute}"</Typography>
                  <Typography variant="h6">
                    {t("route-search-no-result")}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6">{t("no-recent-search")}</Typography>
                </>
              )}
            </Box>
          </Box>
        )}
      </React.Fragment>
    ),
    [itemHeight, coItemDataList, searchRoute, t]
  );

  const availableBoardTab = useMemo(
    () => BOARD_TAB.filter((tab) => isRecentSearchShown || tab !== "recent"),
    [isRecentSearchShown]
  );

  return useMemo(
    () => (
      <>
        {navigator.userAgent === "prerendering" ? (
          <Box sx={prerenderListSx}>
            {coItemDataList[0].routeList.map((data, idx) => (
              <RouteRowList
                data={coItemDataList[0]}
                key={`route-${idx}`}
                index={idx}
                style={null} // required by react-window
              />
            ))}
          </Box>
        ) : (
          <VirtualizeSwipeableViews
            index={availableBoardTab.indexOf(boardTab)}
            onChangeIndex={(idx) => {
              onChangeTab(availableBoardTab[idx]);
            }}
            style={{ flex: 1, display: "flex" }}
            containerStyle={{ flex: 1 }}
            slideCount={coItemDataList.length}
            overscanSlideAfter={1}
            overscanSlideBefore={1}
            slideRenderer={ListRenderer}
            enableMouseEvents={true}
          />
        )}
      </>
    ),
    [ListRenderer, coItemDataList, onChangeTab, boardTab, availableBoardTab]
  );
};

const createItemData = memorize((routeList, vibrateDuration, tab) => ({
  routeList,
  vibrateDuration,
  tab,
}));

const VirtualizeSwipeableViews = bindKeyboard(virtualize(SwipeableViews));

export default SwipeableRoutesBoard;

const BOARD_TAB = ["recent", "all", "bus", "minibus", "lightRail", "mtr"];

const prerenderListSx: SxProps<Theme> = {
  height: "100%",
  overflowY: "scroll",
};

const noResultSx: SxProps<Theme> = {
  height: "140px",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  [`& .MuiSvgIcon-root`]: {
    fontSize: "4em",
    mr: 2,
  },
};
