import React, { useContext, useState, useMemo } from "react";
import {
  Box,
  SxProps,
  Theme,
  Typography,
  Snackbar,
  Button,
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
  const { savedStops, savedEtas, collections } = useContext(AppContext);
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
            },
            null,
            0
          ),
          { outputEncoding: "Base64" }
        )
      ),
    [collections, language, savedEtas, savedStops]
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
        <Box sx={{ m: 1 }}>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              navigator.clipboard?.writeText(exportUrl).then(() => {
                setIsCopied(true);
              });
            }}
            size="large"
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
