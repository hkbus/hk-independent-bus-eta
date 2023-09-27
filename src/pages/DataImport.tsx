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
import AppContext from "../AppContext";
import { isStrings } from "../utils";

const DataImport = () => {
  const { data } = useParams();
  const { t } = useTranslation();
  const { setSavedStops, setSavedEtas, setCollections } =
    useContext(AppContext);
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

  const obj = useMemo(() => {
    try {
      let obj = unpack(data ?? state.split("/").pop());
      if (!Array.isArray(obj.savedStops) && isStrings(obj.savedStops)) {
        throw new Error("Error in parsing savedStops");
      }
      if (!Array.isArray(obj.savedEtas) && isStrings(obj.savedEtas)) {
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
    setSavedStops(obj.savedStops);
    setSavedEtas(obj.savedEtas);
    setCollections(obj.collections);
    navigate("/");
  }, [obj, objStrForm, setSavedStops, setCollections, setSavedEtas, navigate]);

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
      <TextField multiline maxRows={15} value={objStrForm} disabled fullWidth />
      <Button
        startIcon={<CheckIcon />}
        variant="outlined"
        disabled={objStrForm === "{}"}
        onClick={confirm}
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
