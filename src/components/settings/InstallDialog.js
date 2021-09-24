import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useTranslation } from "react-i18next";
import { IosShare } from "@mui/icons-material";

const InstallDialog = ({ open, handleClose }) => {
  const { t } = useTranslation();
  useStyles();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className={"installDialog-dialog"}
    >
      <DialogTitle className={"installDialog-title"}>
        {t("安裝步驟")}
      </DialogTitle>
      <DialogContent>
        <Box className={"installDialog-section"}>
          <Typography variant="h5">iOS:</Typography>
          <br />
          <Typography variant="body1">1. {t("用 Safari 開")}</Typography>
          <Typography variant="body1">
            2. {t("分享")}
            <IosShare />
          </Typography>
          <Typography variant="body1">3. {t("加至主畫面")}</Typography>
        </Box>
        <Divider />
        <Box className={"installDialog-section"}>
          <Typography variant="h5">Android:</Typography>
          <br />
          <Typography variant="body1">1. {t("用 Chrome 開")}</Typography>
          <Typography variant="body1">2. {t("右上選項")}</Typography>
          <Typography variant="body1">
            3. {t("新增至主畫面 / 安裝應用程式")}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const useStyles = makeStyles((theme) => ({
  "@global": {
    ".installDialog-dialog": {
      "& .MuiPaper-root": {
        width: "100%",
        height: "fit-content",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      },
    },
    ".installDialog-title": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? theme.palette.background.default
          : theme.palette.primary.main,
      color:
        theme.palette.mode === "dark"
          ? theme.palette.primary.main
          : theme.palette.text.primary,
    },
    ".installDialog-section": {
      padding: "10px 0px",
    },
  },
}));

export default InstallDialog;
