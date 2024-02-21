import {
  DeleteOutline as DeleteIcon,
  Reorder as ReorderIcon,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { Company, Eta, Location } from "hk-bus-eta";
import React, { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import AppContext from "../../AppContext";
import { ManageMode } from "../../data";
import {
  getLineColor,
  getPlatformSymbol,
  getDistance,
  getDistanceWithUnit,
  toProperCase,
  vibrate,
  distinctFilter,
} from "../../utils";
import RouteNo from "../route-board/RouteNo";
import SuccinctEtas from "./SuccinctEtas";

interface DistAndFareProps {
  name: string;
  location: Location;
  fares: string[] | null;
  faresHoliday: string[] | null;
  seq: number;
}

const DistAndFare = ({
  name,
  location,
  fares,
  faresHoliday,
  seq,
}: DistAndFareProps) => {
  const { t } = useTranslation();
  const { geoPermission, geolocation, manualGeolocation } =
    useContext(AppContext);
  const _fareString = fares && fares[seq] ? "$" + fares[seq] : "";
  const _fareHolidayString =
    faresHoliday && faresHoliday[seq] ? "$" + faresHoliday[seq] : "";
  const fareString = [_fareString, _fareHolidayString]
    .filter((v) => v)
    .join(", ");

  const { distance, unit, decimalPlace } = getDistanceWithUnit(
    getDistance(location, manualGeolocation || geolocation)
  );

  if (geoPermission !== "granted" || location.lat === 0) {
    return <>{name + "　" + (fareString ? "(" + fareString + ")" : "")}</>;
  }

  return (
    <>
      {name +
        " - " +
        distance.toFixed(decimalPlace) +
        t(unit) +
        "　" +
        (fareString ? "(" + fareString + ")" : "")}
    </>
  );
};

interface SuccinctTimeReportProps {
  routeId: string;
  etas?: Eta[];
  mode?: ManageMode | "time";
  onDelete?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const SuccinctTimeReport = ({
  routeId,
  etas = undefined,
  mode = "time",
  onDelete = undefined,
}: SuccinctTimeReportProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    db: { routeList, stopList },
    vibrateDuration,
    platformMode,
  } = useContext(AppContext);
  const [routeNo] = routeId.split("-");
  const [routeKey, seq] = routeId.split("/");
  const { co, stops, dest, fares, faresHoliday, route } =
    routeList[routeKey] || DEFAULT_ROUTE;
  const stopId = getStops(co, stops)[parseInt(seq, 10)];
  const stop = stopList[stopId] || DEFAULT_STOP;

  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    vibrate(vibrateDuration);
    setTimeout(() => {
      navigate(`/${language}/route/${routeId.toLowerCase()}`);
    }, 0);
  };

  const platform = useMemo(() => {
    if (etas && etas.length > 0) {
      const no = etas
        .map((p) =>
          getPlatformSymbol(
            parseInt(
              (/Platform ([\d]+)/gm.exec(p.remark?.en ?? "") ?? [])[1] ?? "0",
              10
            ),
            platformMode
          )
        )
        .filter((p) => p)
        .filter(distinctFilter)
        .sort()
        .join("");
      if (!no) return "";
      return `${no} `;
    }
    return "";
  }, [etas, platformMode]);

  let isEndOfTrainLine = false;
  if (co[0] === "mtr") {
    isEndOfTrainLine = stops["mtr"].indexOf(stopId) + 1 >= stops["mtr"].length;
  } else if (co.includes("lightRail")) {
    isEndOfTrainLine =
      stops["lightRail"].indexOf(stopId) + 1 >= stops["lightRail"].length;
  }

  return (
    <>
      <ListItem
        component={mode === "time" ? Link : undefined}
        to={`/${language}/route/${routeKey.toLowerCase()}`}
        onClick={
          mode === "time"
            ? handleClick
            : (e) => {
                e.preventDefault();
              }
        }
        sx={rootSx}
      >
        <ListItemText
          primary={
            <RouteNo
              entry={routeList[routeKey]}
              routeNo={language === "zh" ? t(routeNo) : routeNo}
              fontSize={co[0] === "mtr" ? "1.1rem" : null}
            />
          }
        />
        <ListItemText
          primary={
            <Typography
              component="h3"
              variant="h6"
              color="textPrimary"
              sx={fromToWrapperSx}
            >
              <span>
                <Box component="span" color={getLineColor(co, route, true)}>
                  {platform}
                </Box>
                {t("往")}
              </span>
              <b>{toProperCase(dest[language])}</b>
            </Typography>
          }
          secondary={
            <DistAndFare
              name={toProperCase(stop.name[language])}
              location={stop.location}
              fares={fares}
              faresHoliday={faresHoliday}
              seq={parseInt(seq, 10)}
            />
          }
          secondaryTypographyProps={{
            component: "h4",
            variant: "subtitle2",
          }}
          sx={routeDestSx}
        />
        {mode === "time" && (
          <SuccinctEtas
            routeId={routeId}
            value={etas}
            isEndOfTrainLine={isEndOfTrainLine}
          />
        )}
        {mode === "order" && (
          <Box sx={iconContainerSx}>
            <ReorderIcon />
          </Box>
        )}
        {mode === "delete" && (
          <Box sx={iconContainerSx}>
            <IconButton onClick={(e) => onDelete && onDelete(e)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </ListItem>
      <Divider />
    </>
  );
};

const DEFAULT_ROUTE = {
  co: ["kmb"] as Company[],
  stops: { "": [""] },
  dest: { zh: "", en: "" },
  bound: "",
  nlbId: 0,
  fares: [],
  faresHoliday: [],
  route: "",
};
const DEFAULT_STOP = {
  location: { lat: 0, lng: 0 },
  name: { zh: "最近車站", en: "The nearest stop" },
};

export default SuccinctTimeReport;

// TODO: better handling on buggy data in database
const getStops = (co, stops) => {
  for (let i = 0; i < co.length; ++i) {
    if (co[i] in stops) {
      return stops[co[i]];
    }
  }
};

const rootSx: SxProps<Theme> = {
  display: "grid",
  gap: (theme) => theme.spacing(1),
  gridTemplateColumns: "15% 1fr minmax(18%, max-content)",
  padding: (theme) => `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  color: "rgba(0,0,0,0.87)",
};

const routeDestSx: SxProps<Theme> = {
  overflow: "hidden",
};

const fromToWrapperSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  "& > span": {
    fontSize: "0.85rem",
    marginRight: (theme) => theme.spacing(0.5),
  },
};

const iconContainerSx: SxProps<Theme> = {
  color: (theme) => theme.palette.text.primary,
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
