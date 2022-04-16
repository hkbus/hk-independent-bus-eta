import { useContext, useEffect } from "react";
import AppContext from "../AppContext";
import { styled } from "@mui/material/styles";
import { List, AppBar, Tabs, Tab } from "@mui/material";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import memorize from "memoize-one";
import RouteInputPad from "../components/route-board/RouteInputPad";
import RouteRow from "../components/route-board/RouteRow";
import { useTranslation } from "react-i18next";
import { setSeoHeader } from "../utils";
import { isHoliday, isRouteAvaliable } from "../timetable";
import { TRANSPORT_SEARCH_OPTIONS } from "../constants";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

const createItemData = memorize((routeList, vibrateDuration) => ({
  routeList,
  vibrateDuration,
}));

const RouteList = () => {
  const {
    AppTitle,
    db: { holidays, routeList },
    searchRoute,
    searchTab,
    setSearchTab,
    isRouteFilter,
    vibrateDuration,
  } = useContext(AppContext);

  const isTodayHoliday = isHoliday(holidays, new Date());
  const targetRouteList = Object.entries(routeList)
    .filter(
      ([routeNo, { stops, co }]) =>
        routeNo.startsWith(searchRoute.toUpperCase()) &&
        (stops[co[0]] == null || stops[co[0]].length > 0)
    )
    .filter(([routeNo, { co }]) =>
      co.some((c) => TRANSPORT_SEARCH_OPTIONS[searchTab].includes(c))
    )
    .filter(
      ([routeNo, { freq }]) =>
        !isRouteFilter || isRouteAvaliable(routeNo, freq, isTodayHoliday)
    );
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setSeoHeader({
      title: t("搜尋") + " - " + t(AppTitle),
      description: t("route-board-page-description"),
      lang: i18n.language,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const itemData = createItemData(targetRouteList, vibrateDuration);
  if (navigator.userAgent === "prerendering") {
    return (
      <PrerenderList className={classes.prerenderList}>
        {targetRouteList.map((data, idx) => (
          <RouteRow
            data={itemData}
            key={`route-${idx}`}
            index={idx}
            style={null}
          />
        ))}
      </PrerenderList>
    );
  }

  return (
    <Root className={classes.list}>
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs
            value={searchTab}
            onChange={(e, v) => setSearchTab(v)}
            className={classes.tabbar}
          >
            {Object.keys(TRANSPORT_SEARCH_OPTIONS).map((option) => (
              <Tab label={t(option)} value={option} disableRipple />
            ))}
          </Tabs>
        </AppBar>
      </div>
      {!!targetRouteList.length ? (
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height * 0.98}
              itemCount={targetRouteList.length}
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
        <div className={classes.noResult}>
          <SentimentVeryDissatisfiedIcon />
          <div>{t("route-search-no-result")}</div>
        </div>
      )}
    </Root>
  );
};

const RouteBoard = () => {
  return (
    <>
      <RouteList />
      <RouteInputPad />
    </>
  );
};

export default RouteBoard;

const PREFIX = "routeBoard";

const classes = {
  root: `${PREFIX}-root`,
  list: `${PREFIX}-list`,
  prerenderList: `${PREFIX}-prerenderList`,
  tabbar: `${PREFIX}-tabbar`,
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

const Root = styled(List)(({ theme }) => ({
  [`&.${classes.root}`]: {
    background:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
  },
  [`&.${classes.list}`]: {
    flex: "1 1 auto",
  },
  [`& .${classes.tabbar}`]: {
    background: theme.palette.background.default,
    minHeight: "36px",
    [`& .MuiTab-root`]: {
      paddingTop: 0,
      paddingBottom: 0,
      minHeight: "32px",
      [`&.Mui-selected`]: {
        color:
          theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
      },
      [`&.MuiButtonBase-root`]: {
        textTransform: "none",
      },
    },
    [`& .MuiTabs-indicator`]: {
      backgroundColor:
        theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
    },
  },
  [`& .${classes.noResult}`]: {
    height: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    [`& .MuiSvgIcon-root`]: {
      fontSize: "8rem",
    },
  },
}));
