import React from "react";
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
} from "@mui/icons-material";

const Support = () => {
  const { t } = useTranslation();

  return (
    <Paper sx={paperSx} square elevation={0}>
      <List sx={{ py: 0 }}>
        <ListItemButton
          component="a"
          href="https://t.me/hkbusapp"
          target="_blank"
          rel="noreferrer"
        >
          <ListItemAvatar>
            <Avatar>
              <TelegramIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("Telegram 交流區")}
            secondary={"https://t.me/hkbusapp"}
          />
        </ListItemButton>
        <ListItemButton
          component="a"
          href="mailto:info@hkbus.app"
          target="_blank"
          rel="noreferrer"
        >
          <ListItemAvatar>
            <Avatar>
              <EmailIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("Email")} secondary={"info@hkbus.app"} />
        </ListItemButton>
        <ListItemButton
          component="a"
          href="https://instagram.com/hkbus.app"
          target="_blank"
          rel="noreferrer"
        >
          <ListItemAvatar>
            <Avatar>
              <InstagramIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("Instagram")} secondary={"@hkbus.app"} />
        </ListItemButton>
        <ListItemButton
          component="a"
          href="https://twitter.com/hkbusApp"
          target="_blank"
          rel="noreferrer"
        >
          <ListItemAvatar>
            <Avatar>
              <TwitterIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("Twitter")} secondary={"@hkbus.app"} />
        </ListItemButton>
      </List>
      <Typography variant="body1">{t("歡迎意見及技術交流")}</Typography>
    </Paper>
  );
};

export default Support;

const paperSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  width: "100%",
  flex: 1,
  gap: 5,
  "& .MuiAvatar-colorDefault": {
    color: (t) =>
      t.palette.mode === "dark" ? t.palette.background.default : "white",
  },
};
