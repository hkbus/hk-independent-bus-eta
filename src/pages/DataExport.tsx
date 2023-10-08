import React, { useContext, useState, useMemo } from "react";
import {
  Box,
  SxProps,
  Theme,
  Typography,
  Snackbar,
  Button,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../AppContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { compress as compressJson } from "lzutf8-light";

const DataExport = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    savedStops,
    savedEtas,
    collections,
    _colorMode,
    energyMode,
    refreshInterval,
    annotateScheduled,
    vibrateDuration,
    etaFormat,
    numPadOrder,
    isRouteFilter,
    busSortOrder,
    analytics,
    isRecentSearchShown,
  } = useContext(AppContext);

  const exportUrl = useMemo<string>(
    () =>
      `https://${window.location.hostname}/${language}/import/` +
      encodeURIComponent(
        compressJson(
          JSON.stringify(
            {
              savedStops,
              savedEtas,
              collections,
              _colorMode,
              energyMode,
              refreshInterval,
              annotateScheduled,
              vibrateDuration,
              etaFormat,
              numPadOrder,
              isRouteFilter,
              busSortOrder,
              analytics,
              isRecentSearchShown,
            },
            null,
            0
          ),
          { outputEncoding: "Base64" }
        )
      ),
    [
      collections,
      savedEtas,
      savedStops,
      _colorMode,
      energyMode,
      refreshInterval,
      annotateScheduled,
      vibrateDuration,
      etaFormat,
      numPadOrder,
      isRouteFilter,
      busSortOrder,
      language,
      analytics,
      isRecentSearchShown,
    ]
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <Box sx={rootSx}>
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        {t("資料匯出")}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          m: 1,
        }}
      >
        <TextField
          variant="outlined"
          value={exportUrl}
          fullWidth
          spellCheck={false}
        />
        <Box sx={{ m: 1 }}>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Export hkbus.app", url: exportUrl });
              } else {
                navigator.clipboard?.writeText(exportUrl).then(() => {
                  setIsCopied(true);
                });
              }
            }}
            size="large"
            sx={buttonSx}
            variant="outlined"
          >
            {t("複制匯出網址")}
          </Button>
        </Box>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isCopied}
        autoHideDuration={1500}
        onClose={() => {
          setIsCopied(false);
        }}
        message={t("已複製到剪貼簿")}
      />
    </Box>
  );
};

export default DataExport;

const rootSx: SxProps<Theme> = {
  justifyContent: "center",
  flex: 1,
};

const buttonSx: SxProps<Theme> = {
  color: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.primary.main
      : theme.palette.text.primary,
  borderColor: (theme) =>
    theme.palette.mode === "dark"
      ? theme.palette.primary.main
      : theme.palette.text.primary,
};
