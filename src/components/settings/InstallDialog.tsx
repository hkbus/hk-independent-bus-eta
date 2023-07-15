import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  SxProps,
  Tab,
  Tabs,
  Theme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { IosShare, MoreVert } from "@mui/icons-material";

const InstallDialog = ({ open, handleClose }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"PWA" | "App">("App");

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={titleSx}>{t("安裝步驟")}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={tabbarSx}>
          <Tab value="App" label="App" />
          <Tab value="PWA" label="PWA" />
        </Tabs>
        {tab === "App" && (
          <Box sx={appBadgeSx}>
            <Box
              onClick={() =>
                window.open(
                  "https://play.google.com/store/apps/details?id=app.hkbus"
                )
              }
            >
              <img src="/google-play-badge.png" alt="Install via Google Play" />
            </Box>
            <Box
              onClick={() =>
                window.open(
                  "https://apps.apple.com/hk/app/%E5%B7%B4%E5%A3%AB%E5%88%B0%E7%AB%99%E9%A0%90%E5%A0%B1-hkbus-app/id1612184906"
                )
              }
            >
              <img
                src="/app-store.svg"
                style={{ margin: "6%", width: "88%" }}
                alt="Install via App Store"
              />
            </Box>
          </Box>
        )}
        {tab === "PWA" && (
          <>
            <Box sx={sectionSx}>
              <Typography variant="h5">iOS:</Typography>
              <br />
              <Typography variant="body1">1. {t("用 Safari 開")}</Typography>
              <Typography variant="body1" style={{ display: "inline" }}>
                2. {t("分享")}
                <IosShare />
              </Typography>
              <Typography variant="body1">3. {t("加至主畫面")}</Typography>
            </Box>
            <Divider />
            <Box sx={sectionSx}>
              <Typography variant="h5">Android:</Typography>
              <br />
              <Typography variant="body1">1. {t("用 Chrome 開")}</Typography>
              <Typography variant="body1" style={{ display: "inline" }}>
                2. {t("右上選項")}
              </Typography>
              <MoreVert />
              <Typography variant="body1">
                3. {t("新增至主畫面 / 安裝應用程式")}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const dialogSx: SxProps<Theme> = {
  width: "100%",
  height: "fit-content",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
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

const sectionSx: SxProps<Theme> = {
  padding: "10px 0px",
};

const tabbarSx: SxProps<Theme> = {
  minHeight: "36px",
  [`& .MuiTab-root`]: {
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: "32px",
    [`&.Mui-selected`]: {
      color: (theme) =>
        theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
    },
  },
  [`& .MuiTabs-indicator`]: {
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
  },
};

const appBadgeSx: SxProps<Theme> = {
  py: 3,
  "& div": {
    width: 120,
    cursor: "pointer",
  },
  "& img": {
    maxWidth: "100%",
    height: "auto",
  },
};

export default InstallDialog;
