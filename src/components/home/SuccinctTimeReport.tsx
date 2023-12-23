import React, { useContext, useMemo } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { getDistance, getDistanceWithUnit, vibrate } from "../../utils";
import AppContext from "../../AppContext";
import { useTranslation } from "react-i18next";
import SuccinctEtas from "./SuccinctEtas";
import { toProperCase } from "../../utils";
import RouteNo from "../route-board/RouteNo";
import { Eta, Location } from "hk-bus-eta";
import { ManageMode } from "../../data";
import {
  DeleteOutline as DeleteIcon,
  Reorder as ReorderIcon,
} from "@mui/icons-material";

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
  const { geoPermission, geolocation, manualGeolocation, isManualGeolocation } =
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
  if (
    isManualGeolocation ||
    geoPermission === "granted" ||
    location.lat !== 0
  ) {
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
  }
  return <>{name + "　" + (fareString ? "(" + fareString + ")" : "")}</>;
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
  } = useContext(AppContext);
  const [routeNo] = routeId.split("-");
  const [routeKey, seq] = routeId.split("/");
  const { co, stops, dest, fares, faresHoliday } =
    routeList[routeKey] || DEFAULT_ROUTE;
  const stop = stopList[getStops(co, stops)[parseInt(seq, 10)]] || DEFAULT_STOP;

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
      const PLATFORM = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦"];
      const no =
        PLATFORM[
          parseInt(
            (/Platform ([\d]+)/gm.exec(etas[0].remark?.en ?? "") ?? [])[1] ??
              "0",
            10
          )
        ];
      if (!no) return "";
      if (language === "zh") return `${no}月台 `;
      else return `Platform ${no} `;
    }
    return "";
  }, [etas, language]);

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
        <ListItemText primary={<RouteNo routeNo={routeNo} />} />
        <ListItemText
          primary={
            <Typography
              component="h3"
              variant="h6"
              color="textPrimary"
              sx={fromToWrapperSx}
            >
              <span>
                {platform}
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
        {mode === "time" && <SuccinctEtas routeId={routeId} value={etas} />}
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
  co: [""],
  stops: { "": [""] },
  dest: { zh: "", en: "" },
  bound: "",
  nlbId: 0,
  fares: [],
  faresHoliday: [],
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
