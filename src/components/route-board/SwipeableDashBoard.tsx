import React, { useContext, useMemo, useRef, useImperativeHandle } from "react";
import SwipeableViews from "react-swipeable-views";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import memorize from "memoize-one";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { Box, SxProps, Theme, Typography } from "@mui/material";

import AppContext from "../../AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";
import type { BoardTabType } from "./BoardTabbar";
import { TRANSPORT_SEARCH_OPTIONS, TRANSPORT_ORDER } from "../../constants";
import RouteRow from "./RouteRow";

interface SwipeableRouteBoardProps {
  boardTab: BoardTabType;
  onChangeTab: (v: string) => void;
}

interface SwipeableRouteBoardRef {
  changeTab: (v: BoardTabType) => void;
}

const SwipeableRoutesBoard = React.forwardRef<
  SwipeableRouteBoardRef,
  SwipeableRouteBoardProps
>(({ boardTab, onChangeTab }, ref) => {
  const {
    searchRoute,
    db: { holidays, routeList },
    isRouteFilter,
    vibrateDuration,
  } = useContext(AppContext);
  const isTodayHoliday = useMemo(
    () => isHoliday(holidays, new Date()),
    [holidays]
  );
  const defaultBoardtab = useRef(boardTab);

  useImperativeHandle(ref, () => ({
    changeTab: (v) => {
      defaultBoardtab.current = v;
    },
  }));

  const baseRouteList = useMemo(
    () =>
      Object.entries(routeList)
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
        .sort(routeSortFunc),
    [routeList, isTodayHoliday, searchRoute, isRouteFilter]
  );

  const { t } = useTranslation();

  const coItemDataList = useMemo(
    () =>
      Object.entries(TRANSPORT_SEARCH_OPTIONS).map(([tab, searchOptions]) =>
        createItemData(
          baseRouteList.filter(([routeNo, { co }]) =>
            co.some((c) => searchOptions.includes(c))
          ),
          vibrateDuration
        )
      ),
    [baseRouteList, vibrateDuration]
  );

  return useMemo(
    () => (
      <>
        {navigator.userAgent === "prerendering" ? (
          <PrerenderList className={classes.prerenderList}>
            {coItemDataList[0].routeList.map((data, idx) => (
              <RouteRow
                data={coItemDataList[0]}
                key={`route-${idx}`}
                index={idx}
                style={null}
              />
            ))}
          </PrerenderList>
        ) : (
          <SwipeableViews
            index={BOARD_TAB.indexOf(defaultBoardtab.current)}
            onChangeIndex={(idx) => onChangeTab(BOARD_TAB[idx])}
            style={{ flex: 1, display: "flex" }}
            containerStyle={{ flex: 1 }}
          >
            {coItemDataList.map((itemData) =>
              !!itemData.routeList.length ? (
                <AutoSizer>
                  {({ height, width }) => (
                    <FixedSizeList
                      height={height * 0.98}
                      itemCount={itemData.routeList.length}
                      itemSize={56}
                      width={width}
                      itemData={itemData}
                      className={classes.root}
                    >
                      {RouteRow}
                    </FixedSizeList>
                  )}
                </AutoSizer>
              ) : (
                <Box sx={noResultSx}>
                  <SentimentVeryDissatisfiedIcon />
                  <Typography variant="h6">"{searchRoute}"</Typography>
                  <Typography variant="h6">
                    {t("route-search-no-result")}
                  </Typography>
                </Box>
              )
            )}
          </SwipeableViews>
        )}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coItemDataList, onChangeTab, t]
  );
});

const createItemData = memorize((routeList, vibrateDuration) => ({
  routeList,
  vibrateDuration,
}));

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

const routeSortFunc = (a, b) => {
  const aRoute = a[0].split("-");
  const bRoute = b[0].split("-");

  // Exclude A-Z from end of strings, smaller number should come first
  if (
    +aRoute[0].replaceAll(/[A-z]$/gi, "") >
    +bRoute[0].replaceAll(/[A-z]$/gi, "")
  ) {
    return 1;
  } else if (
    +aRoute[0].replaceAll(/[A-z]$/gi, "") <
    +bRoute[0].replaceAll(/[A-z]$/gi, "")
  ) {
    return -1;
  }

  // Exclude numbers, smaller alphabet should come first
  if (
    aRoute[0].replaceAll(/[0-9]/gi, "") > bRoute[0].replaceAll(/[0-9]/gi, "")
  ) {
    return 1;
  } else if (
    aRoute[0].replaceAll(/[0-9]/gi, "") < bRoute[0].replaceAll(/[0-9]/gi, "")
  ) {
    return -1;
  }

  // Remove all A-Z, smaller number should come first
  if (
    +aRoute[0].replaceAll(/[A-z]/gi, "") > +bRoute[0].replaceAll(/[A-z]/gi, "")
  ) {
    return 1;
  } else if (
    +aRoute[0].replaceAll(/[A-z]/gi, "") < +bRoute[0].replaceAll(/[A-z]/gi, "")
  ) {
    return -1;
  }

  // Sort by TRANSPORT_ORDER
  const aCompany = a[1]["co"].sort(
    (a, b) => TRANSPORT_ORDER.indexOf(a) - TRANSPORT_ORDER.indexOf(b)
  );
  const bCompany = b[1]["co"].sort(
    (a, b) => TRANSPORT_ORDER.indexOf(a) - TRANSPORT_ORDER.indexOf(b)
  );

  if (
    TRANSPORT_ORDER.indexOf(aCompany[0]) > TRANSPORT_ORDER.indexOf(bCompany[0])
  ) {
    return 1;
  } else if (
    TRANSPORT_ORDER.indexOf(aCompany[0]) < TRANSPORT_ORDER.indexOf(bCompany[0])
  ) {
    return -1;
  }

  // Smaller service Type should come first
  return aRoute[1] > bRoute[1] ? 1 : -1;
};
