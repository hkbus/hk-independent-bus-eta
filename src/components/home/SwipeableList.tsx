import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  List,
  Paper,
  Slider,
  SxProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  styled,
} from "@mui/material";
import {
  EtaDb,
  Location,
  RouteList,
  StopList,
  StopListEntry,
} from "hk-bus-eta";
import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import SwipeableViews from "react-swipeable-views";

import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { isHoliday, isRouteAvaliable } from "../../timetable";
import { RouteCollection, TransportType } from "../../typing";
import { coToType, getDistance, getDistanceWithUnit } from "../../utils";
import { CircularProgress } from "../Progress";
import { BasicMap } from "../map/BasicMap";
import { dialogRootSx, dialogTitleSx } from "../ui/dialog";
import HomeRouteListDropDown from "./HomeRouteList";
import type { HomeTabType } from "./HomeTabbar";
import SuccinctTimeReport from "./SuccinctTimeReport";

interface SwipeableListProps {
  geolocation: Location;
  homeTab: HomeTabType;
  onChangeTab: (v: string) => void;
}

interface SwipeableListRef {
  changeTab: (v: HomeTabType) => void;
}

interface SelectedRoutes {
  saved: string;
  nearby: Partial<Record<TransportType, string>>;
  smartCollections: Array<{
    name: string;
    routes: string;
    defaultExpanded: boolean;
  }>;
  collections: string[];
}

export const searchRangeOptions = [100, 200, 500];

const SwipeableList = React.forwardRef<SwipeableListRef, SwipeableListProps>(
  ({ geolocation, homeTab, onChangeTab }, ref) => {
    const {
      savedEtas,
      db: { holidays, routeList, stopList, serviceDayMap },
      isRouteFilter,
      collections,
      lastSearchRange,
      setLastSearchRange,
      customSearchRange,
      setCustomSearchRange,
      updateGeolocation,
    } = useContext(AppContext);
    const isTodayHoliday = useMemo(
      () => isHoliday(holidays, new Date()),
      [holidays]
    );
    const defaultHometab = useRef(homeTab);
    const { t } = useTranslation();
    const [selectedRoutes, setSelectedRoutes] = useState<SelectedRoutes | null>(
      null
    );
    const [open, setOpen] = useState(false);
    const isCustomRange = !searchRangeOptions.includes(lastSearchRange);
    const [selectedRange, setSelectedRange] = useState<number | "custom">(
      isCustomRange ? "custom" : lastSearchRange
    );
    const [inputValue, setInputValue] = useState<string>(
      isCustomRange ? customSearchRange?.toString() : ""
    );
    const [position, setPosition] = useState(geolocation);
    const [hasNoNearbyRoutes, setHasNoNearbyRoutes] = useState(true);

    useImperativeHandle(ref, () => ({
      changeTab: (v) => {
        defaultHometab.current = v;
      },
    }));

    useEffect(() => {
      setSelectedRoutes(
        getSelectedRoutes({
          geolocation,
          savedEtas,
          collections,
          routeList,
          stopList,
          isRouteFilter,
          isTodayHoliday,
          serviceDayMap,
          lastSearchRange,
        })
      );
    }, [
      geolocation,
      savedEtas,
      collections,
      routeList,
      stopList,
      isRouteFilter,
      isTodayHoliday,
      serviceDayMap,
      lastSearchRange,
    ]);

    const SearchRangeControl = useCallback(() => {
      return (
        <Paper sx={paperSx} component="ul">
          <ListItem key="range-tag">{t("搜尋範圍")}:</ListItem>
          <ToggleButtonGroup
            defaultValue={selectedRange}
            value={selectedRange}
            exclusive
            onChange={(_, value) => {
              setSelectedRange(value);
              setLastSearchRange(value);
            }}
            aria-label="search range"
            sx={toggleButtonGroupSx}
          >
            {searchRangeOptions.map((range) => {
              const { distance } = getDistanceWithUnit(range);
              return (
                <ToggleButton
                  key={`range-${range}`}
                  sx={toggleButtonSx}
                  disableRipple
                  value={range}
                  aria-label={range.toString()}
                >
                  {distance}
                </ToggleButton>
              );
            })}
            <ToggleButton
              key={`range-custom`}
              sx={toggleButtonSx}
              disableRipple
              value={"custom"}
              aria-label={lastSearchRange.toString()}
              onClick={(e) => {
                const hasCustomSearchRange = customSearchRange > 0;
                const isCustom = selectedRange === "custom";
                e.preventDefault();
                if (hasCustomSearchRange) {
                  setSelectedRange("custom");
                  setLastSearchRange(customSearchRange);
                  if (isCustom) {
                    setOpen(true);
                  }
                } else if (!isCustom && hasCustomSearchRange) {
                  setSelectedRange("custom");
                } else setOpen(true);
              }}
            >
              {t("自訂")}
              {customSearchRange > 0 ? `(${customSearchRange})` : null}
            </ToggleButton>
            <ListItem key="unit">{t("米")}</ListItem>
          </ToggleButtonGroup>
        </Paper>
      );
    }, [
      customSearchRange,
      lastSearchRange,
      selectedRange,
      setLastSearchRange,
      t,
    ]);

    const SavedRouteList = useMemo(() => {
      if (selectedRoutes === null) {
        return <CircularProgress sx={{ my: 10 }} />;
      }
      const savedRoutes = selectedRoutes["saved"].split("|");
      const noRoutes = savedRoutes.every((routeId) => !routeId);

      return (
        <React.Fragment>
          {noRoutes ? (
            <Typography sx={{ marginTop: 5 }}>
              <b>{t("未有收藏路線")}</b>
            </Typography>
          ) : (
            <List disablePadding>
              {savedRoutes.map(
                (selectedRoute, idx) =>
                  Boolean(selectedRoute) && (
                    <SuccinctTimeReport
                      key={`route-shortcut-${idx}`}
                      routeId={selectedRoute}
                    />
                  )
              )}
            </List>
          )}
        </React.Fragment>
      );
    }, [selectedRoutes, t]);

    const NearbyRouteList = useMemo(() => {
      if (selectedRoutes?.nearby) {
        setHasNoNearbyRoutes(() => {
          return Object.values(selectedRoutes.nearby)
            .map((nearbyRoutes) =>
              nearbyRoutes.split("|").every((item) => item === "")
            )
            .every(Boolean);
        });
      }
      return selectedRoutes?.nearby ? (
        <>
          {hasNoNearbyRoutes ? (
            <Typography sx={{ marginTop: 5 }}>
              <b>{t("附近未有任何路線")}</b>
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(selectedRoutes.nearby).map(
                ([type, nearbyRoutes]) => (
                  <HomeRouteListDropDown
                    key={`nearby-${type}`}
                    name={t(type)}
                    routeStrings={nearbyRoutes}
                  />
                )
              )}
            </Box>
          )}
          <Dialog
            open={open}
            onClose={() => {
              setOpen(false);
            }}
            sx={dialogRootSx}
          >
            <DialogTitle sx={dialogTitleSx}>
              {t("自訂搜尋範圍（米）")}
            </DialogTitle>
            <BasicMap
              range={parseInt(inputValue) || 0}
              position={position}
              setPosition={setPosition}
            ></BasicMap>
            <Grid container sx={{ px: 4, py: 1, mt: 2 }} spacing={1}>
              <Grid item xs={12}>
                <Slider
                  sx={{
                    "& .MuiSlider-mark": {
                      backgroundColor: "#bfbfbf",
                      height: 8,
                    },
                  }}
                  aria-label="Range"
                  defaultValue={750}
                  value={parseInt(inputValue)}
                  valueLabelDisplay="auto"
                  marks={[
                    { label: "0", value: 0 },
                    { label: "1km", value: 1000 },
                    { label: "2km", value: 2000 },
                    { label: "3km", value: 3000 },
                    { label: "4km", value: 4000 },
                    { label: "5km", value: 5000 },
                  ]}
                  min={0}
                  max={5000}
                  step={250}
                  onChange={(e, value) => setInputValue(value.toString())}
                />
              </Grid>
              <Grid item xs={6}>
                <input
                  style={{ fontSize: "16px", width: "100%", height: "100%" }}
                  type="number"
                  defaultValue={customSearchRange}
                  value={inputValue}
                  min="0"
                  max="9999"
                  step={100}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericalValue = parseInt(value);
                    const [min, max] = [0, 9999];
                    if (numericalValue <= min) {
                      setInputValue(min.toString());
                    } else if (numericalValue >= max) {
                      setInputValue(max.toString());
                    } else setInputValue(value);
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Button
                  disableRipple
                  variant="contained"
                  sx={{
                    color: "black",
                    width: "100%",
                  }}
                  onClick={() => {
                    setSelectedRange("custom");
                    const range = parseInt(inputValue);
                    setLastSearchRange(range);
                    setCustomSearchRange(range);
                    updateGeolocation({ lat: 22.33971, lng: 114.20154 });
                    setOpen(false);
                  }}
                >
                  {t("確定")}
                </Button>
              </Grid>
            </Grid>
          </Dialog>
        </>
      ) : (
        <CircularProgress sx={{ my: 10 }} />
      );
    }, [
      selectedRoutes?.nearby,
      hasNoNearbyRoutes,
      t,
      open,
      inputValue,
      position,
      customSearchRange,
      setLastSearchRange,
      setCustomSearchRange,
      updateGeolocation,
    ]);

    const SmartCollectionRouteList = useMemo(
      () =>
        selectedRoutes?.smartCollections.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {selectedRoutes.smartCollections.map(
              ({ name, routes, defaultExpanded }, idx) => (
                <HomeRouteListDropDown
                  key={`collection-${idx}`}
                  name={name}
                  routeStrings={routes}
                  defaultExpanded={defaultExpanded}
                />
              )
            )}
            {!selectedRoutes.smartCollections.reduce(
              (acc, { routes }) =>
                acc || routes.split("|").filter((v) => Boolean(v)).length > 0,
              false
            ) && (
              <Typography sx={{ marginTop: 5 }} fontWeight={700}>
                {t("未有收藏路線")}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography sx={{ marginTop: 5 }} fontWeight={700}>
            {t("未有收藏路線")}
          </Typography>
        ),
      [t, selectedRoutes]
    );

    const collectionRouteLists = useMemo(
      () =>
        collections.map((_, idx) => {
          const routes = selectedRoutes?.collections[idx].split("|") ?? [];
          const noRoutes = routes.every((routeId) => !routeId);

          return (
            <React.Fragment key={`collection-route-${idx}`}>
              {noRoutes ? (
                <Typography sx={{ marginTop: 5 }}>
                  <b>{t("收藏中未有路線")}</b>
                </Typography>
              ) : (
                <List disablePadding>
                  {routes.map(
                    (selectedRoute, idx) =>
                      Boolean(selectedRoute) && (
                        <SuccinctTimeReport
                          key={`route-shortcut-${idx}`}
                          routeId={selectedRoute}
                        />
                      )
                  )}
                </List>
              )}
            </React.Fragment>
          );
        }),
      [t, collections, selectedRoutes]
    );

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

    return useMemo(
      () => (
        <>
          {/* SwipeableViews has overflow attribute child div and this preventing <SearchRangeControl/> fixed on top using `position: sticky` */}
          {homeTab === "nearby" ? <SearchRangeControl /> : null}
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
            {NearbyRouteList}
            {SavedRouteList}
            {SmartCollectionRouteList}
            {collectionRouteLists?.map((Collection) => Collection)}
          </SwipeableViews>
        </>
      ),
      [
        homeTab,
        SearchRangeControl,
        getViewIdx,
        NearbyRouteList,
        SavedRouteList,
        SmartCollectionRouteList,
        collectionRouteLists,
        onChangeTab,
        collections,
      ]
    );
  }
);

export default SwipeableList;

const HOME_TAB = ["nearby", "saved", "collections"];

const getSelectedRoutes = ({
  savedEtas,
  collections,
  geolocation,
  stopList,
  routeList,
  isRouteFilter,
  isTodayHoliday,
  serviceDayMap,
  lastSearchRange,
}: {
  savedEtas: string[];
  collections: RouteCollection[];
  geolocation: Location;
  stopList: StopList;
  routeList: RouteList;
  isRouteFilter: boolean;
  isTodayHoliday: boolean;
  serviceDayMap: EtaDb["serviceDayMap"];
  lastSearchRange: number;
}): SelectedRoutes => {
  const selectedRoutes = savedEtas
    .filter((routeUrl, index, self) => {
      return (
        self.indexOf(routeUrl) === index && routeUrl.split("/")[0] in routeList
      );
    })
    .map((routeUrl, idx, self): [string, number, number] => {
      const [routeId, stopIdx] = routeUrl.split("/");
      // TODO: taking the longest stop array to avoid error, should be fixed in the database
      const _stops = Object.values(routeList[routeId].stops).sort(
        (a, b) => b.length - a.length
      )[0];
      if (stopIdx !== undefined) {
        // if specified which stop
        return [
          routeUrl,
          getDistance(geolocation, stopList[_stops[stopIdx]].location),
          self.length - idx,
        ];
      } else {
        // else find the nearest stop
        const stop = _stops
          .map((stop) => [
            stop,
            getDistance(geolocation, stopList[stop].location),
          ])
          .sort(([, a], [, b]) => (a < b ? -1 : 1))[0][0];
        return [
          routeUrl,
          getDistance(geolocation, stopList[stop].location),
          self.length - idx,
        ];
      }
    });

  const nearbyRoutes = Object.entries(stopList)
    .map((stop: [string, StopListEntry]): [string, StopListEntry, number] =>
      // potentially could be optimized by other distance function
      [...stop, getDistance(stop[1].location, geolocation)]
    )
    .filter(
      (stop) =>
        // keep only nearby 1000m stops
        stop[2] < lastSearchRange
    )
    .sort((a, b) => a[2] - b[2])
    .slice(0, 20)
    .reduce(
      (acc, [stopId]) => {
        Object.entries(routeList).forEach(([key, route]) => {
          ["kmb", "lrtfeeder", "lightRail", "gmb", "ctb", "nlb"].forEach(
            (co) => {
              if (route.stops[co] && route.stops[co].includes(stopId)) {
                if (acc[coToType[co]] === undefined) acc[coToType[co]] = [];
                acc[coToType[co]].push(
                  key + "/" + route.stops[co].indexOf(stopId)
                );
              }
            }
          );
        });
        return acc;
      },
      { bus: [], mtr: [], lightRail: [], minibus: [] }
    );

  const collectionRoutes = collections.reduce(
    (acc, { name, list, schedules }) => {
      acc.push({
        name: name,
        routes: list,
        defaultExpanded: schedules.reduce((acc, { day, start, end }) => {
          if (acc) return acc;
          const curDate = new Date();
          curDate.setUTCHours(curDate.getUTCHours() + 8);
          const _day = curDate.getUTCDay();
          // skip handling timezone here
          if ((isTodayHoliday && day === 0) || day === _day) {
            let sTs = start.hour * 60 + start.minute;
            let eTs = end.hour * 60 + end.minute;
            let curTs =
              (curDate.getUTCHours() * 60 + curDate.getUTCMinutes()) % 1440;
            return sTs <= curTs && curTs <= eTs;
          }
          return false;
        }, false),
      });
      return acc;
    },
    []
  );

  const formatHandling = (routes) => {
    return routes
      .filter((v, i, s) => s.indexOf(v) === i) // uniqify
      .filter((routeUrl) => {
        const [routeId] = routeUrl.split("/");
        return (
          routeList[routeId] &&
          (!isRouteFilter ||
            isRouteAvaliable(
              routeId,
              routeList[routeId].freq,
              isTodayHoliday,
              serviceDayMap
            ))
        );
      })
      .map((routeUrl) => {
        // handling for saved route without specified stop, use the nearest one
        const [routeId, stopIdx] = routeUrl.split("/");
        if (stopIdx !== undefined) return routeUrl;
        const _stops = Object.values(routeList[routeId].stops).sort(
          (a, b) => b.length - a.length
        )[0];
        const stop = _stops
          .map((stop) => [
            stop,
            getDistance(geolocation, stopList[stop].location),
          ])
          .sort(([, a], [, b]) => (a < b ? -1 : 1))[0][0];
        return `${routeUrl}/${_stops.indexOf(stop as string)}`;
      })
      .concat(Array(40).fill("")) // padding
      .slice(0, 40)
      .join("|");
  };

  return {
    saved: formatHandling(
      selectedRoutes
        .sort((a, b) => a[2] - b[2])
        .map((v) => v[0])
        .slice(0, 40)
    ),
    nearby: Object.entries(nearbyRoutes).reduce((acc, [type, nearbyRoutes]) => {
      acc[type] = formatHandling(nearbyRoutes);
      return acc;
    }, {}),
    smartCollections: collectionRoutes.map((v) => ({
      ...v,
      routes: formatHandling(v.routes),
    })),
    collections: collections.map((colleciton) =>
      formatHandling(colleciton.list)
    ),
  };
};

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const paperSx: SxProps<Theme> = (theme) => {
  return {
    position: "sticky",
    top: 0,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    listStyle: "none",
    px: 0,
    py: 1,
    m: 0,
    borderRadius: 0,
    fontSize: 14,
    // TODO: make sticky
  };
};

const toggleButtonGroupSx: SxProps<Theme> = ({ palette }) => {
  return {};
};

const toggleButtonSx: SxProps<Theme> = (theme) => {
  return {
    height: 30,
    borderRadius: 15,
    px: 1.5,
    "&.MuiButtonBase-root&.Mui-selected": {
      backgroundColor: ({ palette }) => palette.primary.main,
      color: "black",
    },
  };
};
