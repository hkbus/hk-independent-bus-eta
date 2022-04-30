import React, { useContext } from "react";
import {
  Avatar,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  SxProps,
  Theme,
} from "@mui/material";
import {
  Battery20 as Battery20Icon,
  BatteryStd as BatteryStdIcon,
  Delete as DeleteIcon,
  Timer as TimerIcon,
  Brightness7 as Brightness7Icon,
  NightsStay as NightsStayIcon,
  AllInclusive as AllInclusiveIcon,
  FilterAlt as FilterAltIcon,
  Vibration as VibrationIcon,
  DoNotDisturbOn as DoNotDisturbOnIcon,
  Filter1 as Filter1Icon,
  Filter7 as Filter7Icon,
  Sort as SortIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { ETA_FORMAT_STR } from "../../constants";
import AppContext from "../../AppContext";
import { vibrate } from "../../utils";
import { useTranslation } from "react-i18next";

interface PersonalizeModalProps {
  open: boolean;
  handleClose: () => void;
}

const PersonalizeDialog = ({ open, handleClose }: PersonalizeModalProps) => {
  const {
    resetUsageRecord,
    isRouteFilter,
    toggleRouteFilter,
    busSortOrder,
    toggleBusSortOrder,
    numPadOrder,
    toggleNumPadOrder,
    etaFormat,
    toggleEtaFormat,
    colorMode,
    toggleColorMode,
    energyMode,
    toggleEnergyMode,
    vibrateDuration,
    toggleVibrateDuration,
  } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={DialogTitleSx}>
        {t("個性化設定")}
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <List sx={ListSx}>
        <ListItem
          button
          onClick={() => {
            vibrate(vibrateDuration);
            toggleColorMode();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              {colorMode === "dark" ? <NightsStayIcon /> : <Brightness7Icon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("黑夜模式")}
            secondary={t(colorMode === "dark" ? "開啟" : "關閉")}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(vibrateDuration);
            toggleRouteFilter();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              {isRouteFilter ? <FilterAltIcon /> : <AllInclusiveIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("路線篩選")}
            secondary={t(isRouteFilter ? "只顯示現時路線" : "顯示所有路線")}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(vibrateDuration);
            toggleBusSortOrder();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <SortIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("巴士排序")} secondary={t(busSortOrder)} />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(vibrateDuration);
            toggleNumPadOrder();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              {numPadOrder[0] === "1" ? <Filter1Icon /> : <Filter7Icon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("鍵盤格式")} secondary={numPadOrder} />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(vibrateDuration);
            toggleEtaFormat();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <TimerIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("報時格式")}
            secondary={t(ETA_FORMAT_STR[etaFormat])}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(vibrateDuration);
            toggleEnergyMode();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              {energyMode ? <Battery20Icon /> : <BatteryStdIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("省電模式")}
            secondary={t(!energyMode ? "開啟地圖功能" : "關閉地圖功能")}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(vibrateDuration ^ 1); // tricky, vibrate when switch on and vice versa
            toggleVibrateDuration();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              {vibrateDuration ? <VibrationIcon /> : <DoNotDisturbOnIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("按鍵震動")}
            secondary={t(vibrateDuration ? "開啟" : "關閉")}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(vibrateDuration);
            resetUsageRecord();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <DeleteIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("一鍵清空用戶記錄")}
            secondary={t("包括鎖定和常用報時")}
            secondaryTypographyProps={{ component: "h3", variant: "body2" }}
          />
        </ListItem>
      </List>
    </Dialog>
  );
};

export default PersonalizeDialog;

const DialogTitleSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
};

const ListSx: SxProps<Theme> = {
  "& .MuiAvatar-colorDefault": {
    color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
  },
  overflow: "scroll",
};
