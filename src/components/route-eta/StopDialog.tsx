import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  SxProps,
  Theme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { routeSortFunc } from "../../utils";
import { TRANSPORT_ORDER } from "../../constants";

const StopDialog = ({ open, stops, handleClose }) => {
  const {
    db: { routeList, stopList },
    busSortOrder,
  } = useContext(AppContext);
  const { i18n } = useTranslation();
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (stops === undefined) {
      setRoutes([]);
      return;
    }
    let _routes = [];
    Object.entries(routeList)
      .sort((a, b) => routeSortFunc(a, b, TRANSPORT_ORDER[busSortOrder]))
      .forEach(([key, route]) => {
        stops.some(([co, stopId]) => {
          if (route.stops[co] && route.stops[co].includes(stopId)) {
            _routes.push(key + "/" + route.stops[co].indexOf(stopId));
            return true;
          }
          return false;
        });
      });
    setRoutes(_routes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);

  return (
    <Dialog open={open} onClose={handleClose} sx={rootSx}>
      <DialogTitle sx={titleSx}>
        {stopList[stops[0][1]].name[i18n.language]}
      </DialogTitle>
      <DialogContent>
        <List>
          {routes.map((route) => (
            <SuccinctTimeReport key={route} routeId={route} />
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

const rootSx: SxProps<Theme> = {
  "& .MuiPaper-root": {
    width: "100%",
    marginTop: "90px",
    height: "calc(100vh - 100px)",
  },
  "& .MuiDialogContent-root": {
    padding: 0,
  },
};

const titleSx: SxProps<Theme> = {
  backgroundColor: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.primary.main,
  color: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.primary.main
      : theme.palette.text.primary,
};

export default StopDialog;
