import React, { useContext } from "react";
import {
  Avatar,
  Divider,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  SxProps,
  Theme,
  Slider,
} from "@mui/material";
import {
  Code as CodeIcon,
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
  SortByAlpha as SortByAlphaIcon,
  Sort as SortIcon,
  HourglassTop as HourglassTopIcon,
} from "@mui/icons-material";
import { ETA_FORMAT_STR } from "../../constants";
import AppContext from "../../AppContext";
import { vibrate } from "../../utils";
import { useTranslation } from "react-i18next";

interface OptionsListProps {
  goToTab: (tab: string) => void;
}

const OptionsList = ({ goToTab }: OptionsListProps) => {
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
    refreshInterval,
    updateRefreshInterval,
  } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <List sx={ListSx}>
      <ListItemButton
        onClick={() => {
          vibrate(vibrateDuration);
          goToTab("savedOrder");
        }}
      >
        <ListItemAvatar>
          <Avatar>
            <CodeIcon sx={{ transform: "rotate(90deg)" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={t("常用報時排序")} />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          vibrate(vibrateDuration);
          goToTab("collectionOrder");
        }}
      >
        <ListItemAvatar>
          <Avatar>
            <SortByAlphaIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={t("收藏排序")} />
      </ListItemButton>
      <ListItemButton
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
      </ListItemButton>
      <ListItemButton
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
      </ListItemButton>
      <ListItemButton onClick={() => {}}>
        <ListItemAvatar>
          <Avatar>
            <HourglassTopIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={t("更新頻率")}
          secondary={
            <Slider
              step={1}
              min={5}
              max={60}
              value={refreshInterval / 1000}
              valueLabelDisplay="auto"
              size="small"
              valueLabelFormat={(v: number) => `${v}s`}
              onChange={(e: Event, v: number) =>
                updateRefreshInterval(v * 1000)
              }
            />
          }
        />
      </ListItemButton>
      <Divider />
      <ListItemButton
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
      </ListItemButton>
      <ListItemButton
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
      </ListItemButton>
      <ListItemButton
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
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          vibrate(vibrateDuration);
          toggleEnergyMode();
        }}
      >
        <ListItemAvatar>
          <Avatar>{energyMode ? <Battery20Icon /> : <BatteryStdIcon />}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={t("省電模式")}
          secondary={t(!energyMode ? "開啟地圖功能" : "關閉地圖功能")}
        />
      </ListItemButton>
      <ListItemButton
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
      </ListItemButton>
      <Divider />
      <ListItemButton
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
        />
      </ListItemButton>
    </List>
  );
};

export default OptionsList;

const ListSx: SxProps<Theme> = {
  "& .MuiAvatar-colorDefault": {
    color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
  },
  "& .MuiSlider-colorPrimary": {
    color: (theme) =>
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(0, 0, 0, 0.6)",
  },
  overflow: "scroll",
};
