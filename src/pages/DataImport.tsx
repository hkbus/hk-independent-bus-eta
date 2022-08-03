import React, { useContext, useState } from "react";
import {
  Box,
  SxProps,
  TextField,
  Theme,
  IconButton,
  Typography,
  Snackbar,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../AppContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const DataImport = () => {
  const { t } = useTranslation();
  const { savedEtas, setSavedEtas } = useContext(AppContext);
  const [data, setData] = useState<string>(JSON.stringify(savedEtas, null, 2));
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleChange = ({ target: { value } }) => {
    setData(value);
    try {
      const _savedEtas = JSON.parse(value);
      if (Array.isArray(_savedEtas)) {
        setSavedEtas(
          _savedEtas.filter(
            (routeId) =>
              typeof routeId === "string" || routeId instanceof String
          )
        );
      }
    } catch {}
  };

  return (
    <Box sx={rootSx}>
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        {t("資料匯出匯入")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", m: 1 }}>
        <TextField multiline value={data} onChange={handleChange} />
        <Box sx={{ m: 1 }}>
          <IconButton
            onClick={() => {
              navigator.clipboard
                ?.writeText(JSON.stringify(savedEtas, null, 2))
                .then(() => {
                  setIsCopied(true);
                });
            }}
          >
            <ContentCopyIcon />
          </IconButton>
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

export default DataImport;

const rootSx: SxProps<Theme> = {
  justifyContent: "center",
  flex: 1,
};

const tabbarSx: SxProps<Theme> = {
  background: (theme) => theme.palette.background.default,
  minHeight: "36px",
  [`& .MuiTab-root`]: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: "32px",
    [`&.Mui-selected`]: {
      color: (theme) =>
        theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
    },
  },
  [`& .MuiTabs-flexContainer`]: {
    justifyContent: "center",
  },
  [`& .MuiTabs-indicator`]: {
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
  },
};

const containerSx: SxProps<Theme> = {
  display: "flex",
  flex: 1,
  justifyContent: "center",
  mt: 2,
};

const textBoxSx: SxProps<Theme> = {
  whiteSpace: "pre",
  borderWidth: 1,
  borderStyle: "solid",
  p: 1,
};
