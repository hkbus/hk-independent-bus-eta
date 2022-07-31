import React, {
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import SwipeableViews from "react-swipeable-views";
import { virtualize, bindKeyboard } from "react-swipeable-views-utils";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { Box, SxProps, Theme, Typography } from "@mui/material";

import AppContext from "../../AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";
import type { BoardTabType } from "./BoardTabbar";
import { TRANSPORT_SEARCH_OPTIONS, TRANSPORT_ORDER } from "../../constants";
import RouteRow from "./RouteRow";
import { routeSortFunc } from "../../utils";

interface SwipeableRouteBoardProps {
  boardTab: BoardTabType;
  onChangeTab: (v: string) => void;
}

const SwipeableRoutesBoard = ({
  boardTab,
  onChangeTab,
}: SwipeableRouteBoardProps) => {
  const { searchRoute, db, isRouteFilter, busSortOrder, vibrateDuration } =
    useContext(AppContext);
  const isTodayHoliday = useMemo(
    () => isHoliday(db.holidays ?? [], new Date()),
    [db.holidays]
  );
  const { t } = useTranslation();

  const coItemDataList = useMemo(() => {
    if (db.routeList === undefined) {
      return [];
    }
    const baseRouteList = Object.entries(db.routeList)
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
    return Object.values(TRANSPORT_SEARCH_OPTIONS).map((searchOptions) => ({
      routeList: baseRouteList.filter(([routeNo, { co }]) =>
        co.some((c) => searchOptions.includes(c))
      ),
      vibrateDuration,
    }));
  }, [
    db.routeList,
    searchRoute,
    isRouteFilter,
    isTodayHoliday,
    busSortOrder,
    vibrateDuration,
  ]);

  const ListRenderer = useCallback(
    ({ key, index }) => (
      <div key={key} style={{ height: "100%" }}>
        {!!coItemDataList[index]?.routeList.length ? (
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                height={Math.min(height * 0.98, window.screen.height)}
                itemCount={coItemDataList[index].routeList.length}
                itemSize={56}
                width={width}
                itemData={coItemDataList[index]}
                className={classes.root}
              >
                {RouteRow}
              </FixedSizeList>
            )}
          </AutoSizer>
        ) : (
          <Box sx={noResultSx}>
            <SentimentVeryDissatisfiedIcon />
            <Typography variant="h6">&quot;{searchRoute}&quot;</Typography>
            <Typography variant="h6">{t("route-search-no-result")}</Typography>
          </Box>
        )}
      </div>
    ),
    [coItemDataList, searchRoute, t]
  );

  const onChangeIndex = useCallback(
    (idx: number) => {
      onChangeTab(BOARD_TAB[idx]);
    },
    [onChangeTab]
  );
  const [prerender, setPrerender] = useState(true);
  useEffect(() => {
    setPrerender(false);
  }, []);
  return useMemo(() => {
    const list = coItemDataList[0]?.routeList ?? [];
    return (
      <>
        {prerender ? (
          <PrerenderList className={classes.prerenderList}>
            {list.slice(0, Math.min(list.length, 100)).map((data, idx) => (
              <RouteRow
                data={coItemDataList[0]}
                key={`route-${idx}`}
                index={idx}
                style={null}
              />
            ))}
          </PrerenderList>
        ) : (
          <VirtualizeSwipeableViews
            index={BOARD_TAB.indexOf(boardTab)}
            onChangeIndex={onChangeIndex}
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
    );
  }, [prerender, coItemDataList, boardTab, onChangeIndex, ListRenderer]);
};

const VirtualizeSwipeableViews = bindKeyboard(virtualize(SwipeableViews));

export default SwipeableRoutesBoard;

const BOARD_TAB = ["all", "bus", "minibus", "lightRail", "mtr"];

const PREFIX = "routeBoard";

const classes = {
  root: `${PREFIX}-root`,
  prerenderList: `${PREFIX}-prerenderList`,
  noResult: `${PREFIX}-noResult`,
};

const PrerenderList = styled("div")(({ theme }) => ({
  [`&.${classes.prerenderList}`]: {
    height: "100%",
    overflowY: "scroll",
    "& a": {
      textDecoration: "none",
    },
  },
}));

const noResultSx: SxProps<Theme> = {
  height: "300px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
  [`& .MuiSvgIcon-root`]: {
    fontSize: "8rem",
  },
};
