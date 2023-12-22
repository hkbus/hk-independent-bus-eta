import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  Box,
  Button,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { decompress } from "lzutf8-light";
import { Check as CheckIcon } from "@mui/icons-material";
import throttle from "lodash.throttle";
import AppContext, { AppState, defaultSearchRange } from "../AppContext";
import { defaultLocation, isStrings } from "../utils";
import { CollectionState } from "../CollectionContext";

const DataImport = () => {
  const { data } = useParams();
  const { t } = useTranslation();
  const { importAppState, importCollectionState } = useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = useState<string>(data ?? "");

  const unpack = useMemo(
    () =>
      throttle((str: string) => {
        try {
          return JSON.parse(
            decompress(decodeURIComponent(str), { inputEncoding: "Base64" })
          );
        } catch (e) {
          return {};
        }
      }, 500),
    []
  );

  const obj = useMemo<AppState & CollectionState>(() => {
    try {
      let obj = unpack(data ?? state.split("/").pop());

      if (!Array.isArray(obj.savedStops) || !isStrings(obj.savedStops)) {
        throw new Error("Error in parsing savedStops");
      }
      if (!Array.isArray(obj.savedEtas) || !isStrings(obj.savedEtas)) {
        throw new Error("Error in parsing savedEtas");
      }
      if (!Array.isArray(obj.collections)) {
        throw new Error("Error in parsing collections");
      }
      for (let i = 0; i < obj.collections.length; ++i) {
        if (typeof obj.collections[i].name !== "string") {
          throw new Error("Error in parsing collections");
        }
        for (let j = 0; j < obj.collections[i].list.length; ++j) {
          if (typeof obj.collections[i].list[j] !== "string") {
            throw new Error("Error in parsing collections");
          }
        }
        for (let j = 0; j < obj.collections[i].schedules.length; ++j) {
          if (typeof obj.collections[i].schedules[j].day !== "number") {
            throw new Error("Error in parsing collections");
          }
          if (typeof obj.collections[i].schedules[j].start.hour !== "number") {
            throw new Error("Error in parsing collections");
          }
          if (
            typeof obj.collections[i].schedules[j].start.minute !== "number"
          ) {
            throw new Error("Error in parsing collections");
          }
          if (typeof obj.collections[i].schedules[j].end.hour !== "number") {
            throw new Error("Error in parsing collections");
          }
          if (typeof obj.collections[i].schedules[j].end.minute !== "number") {
            throw new Error("Error in parsing collections");
          }
        }
      }

      return obj;
    } catch (e) {
      console.error(e);
    }
    return {};
  }, [unpack, data, state]);

  const objStrForm = useMemo(() => JSON.stringify(obj, null, 2), [obj]);

  const confirm = useCallback(() => {
    if (objStrForm === "{}") return;
    importCollectionState({
      savedStops: obj.savedStops ?? [],
      savedEtas: obj.savedEtas ?? [],
      collections: obj.collections ?? [],
      collectionDrawerRoute: null,
      collectionIdx: null,
    });
    importAppState({
      geoPermission: null,
      compassPermission: "default",
      geolocation: defaultLocation,
      manualGeolocation: defaultLocation,
      searchRoute: "",
      selectedRoute: "1-1-CHUK-YUEN-ESTATE-STAR-FERRY",
      routeSearchHistory: obj.routeSearchHistory ?? [],
      isRouteFilter: obj.isRouteFilter ?? true,
      busSortOrder: obj.busSortOrder ?? "KMB first",
      numPadOrder: obj.numPadOrder ?? "123456789c0b",
      etaFormat: obj.etaFormat ?? "diff",
      _colorMode: obj._colorMode ?? "system",
      energyMode: obj.energyMode ?? false,
      vibrateDuration: obj.vibrateDuration ?? 1,
      isVisible: true,
      analytics: obj.analytics ?? true,
      refreshInterval: obj.refreshInterval ?? 30,
      annotateScheduled: obj.annotateScheduled ?? true,
      isRecentSearchShown: obj.isRecentSearchShown ?? true,
      fontSize: obj.fontSize ?? 16,
      lastSearchRange: obj.lastSearchRange ?? defaultSearchRange,
      customSearchRange: obj.customSearchRange ?? 0,
    });

    navigate("/");
  }, [obj, objStrForm, importAppState, importCollectionState, navigate]);

  return (
    <Box sx={rootSx}>
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        {t("資料匯入")}
      </Typography>
      {!data && (
        <TextField
          variant="outlined"
          value={state}
          onChange={({ target: { value } }) => setState(value)}
          fullWidth
          label={t("匯出網址")}
        />
      )}
      <TextField
        multiline
        maxRows={15}
        value={objStrForm}
        disabled
        fullWidth
        spellCheck={false}
      />
      <Button
        startIcon={<CheckIcon />}
        variant="outlined"
        disabled={objStrForm === "{}"}
        onClick={confirm}
        sx={buttonSx}
      >
        {t("Accept")}
      </Button>
    </Box>
  );
};

export default DataImport;

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  flex: 1,
  gap: 1,
};

const buttonSx: SxProps<Theme> = {
  color: (t) =>
    t.palette.mode === "light"
      ? t.palette.text.primary
      : t.palette.primary.main,
  borderColor: (t) =>
    t.palette.mode === "light"
      ? t.palette.text.primary
      : t.palette.primary.main,
};
