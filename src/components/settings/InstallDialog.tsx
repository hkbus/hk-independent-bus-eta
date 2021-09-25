import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { IosShare, MoreVert } from "@mui/icons-material";

const InstallDialog = ({ open, handleClose }) => {
  const { t } = useTranslation();

  return (
    <DialogRoot open={open} onClose={handleClose} className={classes.root}>
      <DialogTitle className={classes.title}>{t("安裝步驟")}</DialogTitle>
      <DialogContent>
        <Box className={classes.section}>
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
        <Box className={classes.section}>
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
      </DialogContent>
    </DialogRoot>
  );
};

const PREFIX = "installDialog";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  section: `${PREFIX}-section`,
};

const DialogRoot = styled(Dialog)(({ theme }) => ({
  [`&.${classes.root}`]: {
    "& .MuiPaper-root": {
      width: "100%",
      height: "fit-content",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
  },
  [`& .${classes.title}`]: {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : theme.palette.primary.main,
    color:
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.text.primary,
  },
  [`& .${classes.section}`]: {
    padding: "10px 0px",
  },
}));

export default InstallDialog;
