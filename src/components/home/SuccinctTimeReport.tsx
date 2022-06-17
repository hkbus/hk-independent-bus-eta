import React, { useContext } from "react";
import {
  Box,
  Divider,
  ListItem,
  ListItemText,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import ReorderIcon from "@mui/icons-material/Reorder";
import { Link, useHistory } from "react-router-dom";
import { vibrate } from "../../utils";
import { styled } from "@mui/material/styles";
import AppContext from "../../AppContext";
import { useTranslation } from "react-i18next";
import SuccinctEtas from "./SuccinctEtas";
import { getDistance, toProperCase } from "../../utils";
import RouteNo from "../route-board/RouteNo";
import { Location } from "hk-bus-eta";

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
  const { geoPermission, geolocation } = useContext(AppContext);
  const _fareString = fares && fares[seq] ? "$" + fares[seq] : "";
  const _fareHolidayString =
    faresHoliday && faresHoliday[seq] ? "$" + faresHoliday[seq] : "";
  const fareString = [_fareString, _fareHolidayString]
    .filter((v) => v)
    .join(", ");

  if (geoPermission !== "granted" || location.lat === 0) {
    return <>{name + "　" + (fareString ? "(" + fareString + ")" : "")}</>;
  }

  return (
    <>
      {name +
        " - " +
        getDistance(location, geolocation).toFixed(0) +
        t("米") +
        "　" +
        (fareString ? "(" + fareString + ")" : "")}
    </>
  );
};

interface SuccinctTimeReportProps {
  routeId: string;
  disabled?: boolean;
}

const SuccinctTimeReport = ({
  routeId,
  disabled = false,
}: SuccinctTimeReportProps) => {
  const { t, i18n } = useTranslation();
  const {
    db: { routeList, stopList },
    vibrateDuration,
  } = useContext(AppContext);
  const [routeNo] = routeId.split("-");
  const [routeKey, seq] = routeId.split("/");
  const { co, stops, dest, fares, faresHoliday } =
    routeList[routeKey] || DefaultRoute;
  const stop = stopList[getStops(co, stops)[parseInt(seq, 10)]] || DefaultStop;

  const history = useHistory();
  const handleClick = (e) => {
    e.preventDefault();
    vibrate(vibrateDuration);
    setTimeout(() => {
      history.push(`/${i18n.language}/route/${routeId.toLowerCase()}`);
    }, 0);
  };

  return (
    <>
      <RootListItem
        // @ts-ignore
        component={!disabled ? Link : undefined}
        to={`/${i18n.language}/route/${routeKey.toLowerCase()}`}
        onClick={!disabled ? handleClick : () => {}}
        className={classes.listItem}
      >
        <ListItemText
          primary={<RouteNo routeNo={routeNo} />}
          className={classes.route}
        />
        <ListItemText
          primary={
            <Typography
              component="h3"
              variant="body1"
              color="textPrimary"
              className={classes.fromToWrapper}
            >
              <span className={classes.fromToText}>{t("往")}</span>
              <b>{toProperCase(dest[i18n.language])}</b>
            </Typography>
          }
          secondary={
            <DistAndFare
              name={toProperCase(stop.name[i18n.language])}
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
          className={classes.routeDest}
        />
        {!disabled ? (
          <SuccinctEtas routeId={routeId} />
        ) : (
          <Box sx={iconContainerSx}>
            <ReorderIcon />
          </Box>
        )}
      </RootListItem>
      <Divider />
    </>
  );
};

const DefaultRoute = {
  co: [""],
  stops: { "": [""] },
  dest: { zh: "", en: "" },
  bound: "",
  nlbId: 0,
  fares: [],
  faresHoliday: [],
};
const DefaultStop = { location: { lat: 0, lng: 0 }, name: { zh: "", en: "" } };

export default SuccinctTimeReport;

// TODO: better handling on buggy data in database
const getStops = (co, stops) => {
  for (let i = 0; i < co.length; ++i) {
    if (co[i] in stops) {
      return stops[co[i]];
    }
  }
};

const PREFIX = "succinctTimeReport";

const classes = {
  listItem: `${PREFIX}-listItem`,
  route: `${PREFIX}-route`,
  routeDest: `${PREFIX}-routeDest`,
  fromToWrapper: `${PREFIX}-fromToWrapper`,
  fromToText: `${PREFIX}-fromToText`,
};

const RootListItem = styled(ListItem)(({ theme }) => ({
  [`&.${classes.listItem}`]: {
    padding: "4px 16px",
    color: "rgba(0,0,0,0.87)",
  },
  [`& .${classes.route}`]: {
    width: "15%",
  },
  [`& .${classes.routeDest}`]: {
    width: "50%",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  [`& .${classes.fromToWrapper}`]: {
    display: "flex",
    alignItems: "baseline",
    fontSize: "1.2rem",
  },
  [`& .${classes.fromToText}`]: {
    fontSize: "0.85rem",
    marginRight: theme.spacing(0.5),
  },
}));

const iconContainerSx: SxProps<Theme> = {
  color: (theme) => theme.palette.text.primary,
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
