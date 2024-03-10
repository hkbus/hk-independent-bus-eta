import { useContext } from "react";
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
  ListItem,
} from "@mui/material";
import {
  SwipeUpOutlined as SwipeUpIcon,
  Battery20 as Battery20Icon,
  BatteryStd as BatteryStdIcon,
  Delete as DeleteIcon,
  Timer as TimerIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SettingsBrightnessIcon,
  WbSunny as WbSunnyIcon,
  AllInclusive as AllInclusiveIcon,
  FilterAlt as FilterAltIcon,
  Vibration as VibrationIcon,
  DoNotDisturbOn as DoNotDisturbOnIcon,
  Filter1 as Filter1Icon,
  Filter7 as Filter7Icon,
  Sort as SortIcon,
  HourglassTop as HourglassTopIcon,
  PushPin as PinIcon,
  Update as UpdateIcon,
  UpdateDisabled as UpdateDisabledIcon,
  FormatSize as FormatSizeIcon,
  LooksOneRounded as LooksOneRoundedIcon,
} from "@mui/icons-material";
import { ETA_FORMAT_STR } from "../../constants";
import AppContext from "../../AppContext";
import { vibrate } from "../../utils";
import { useTranslation } from "react-i18next";
import FontSizeSlider from "./FontSizeSlider";

interface OptionsListProps {
  goToManage: () => void;
}

const OptionsList = ({ goToManage }: OptionsListProps) => {
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
    _colorMode: colorMode,
    toggleColorMode,
    energyMode,
    toggleEnergyMode,
    platformMode,
    togglePlatformMode,
    vibrateDuration,
    toggleVibrateDuration,
    refreshInterval,
    updateRefreshInterval,
    annotateScheduled,
    toggleAnnotateScheduled,
    isRecentSearchShown,
    toggleIsRecentSearchShown,
  } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <List sx={ListSx}>
      <ListItemButton
        onClick={() => {
          vibrate(vibrateDuration);
          goToManage();
        }}
      >
        <ListItemAvatar>
          <Avatar>
            <SwipeUpIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={t("管理收藏")} />
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
              onChange={(_, v: number | number[]) =>
                updateRefreshInterval((v as number) * 1000)
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
            {colorMode === "system" && <SettingsBrightnessIcon />}
            {colorMode === "light" && <WbSunnyIcon />}
            {colorMode === "dark" && <DarkModeIcon />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={t("外觀")} secondary={t(`color-${colorMode}`)} />
      </ListItemButton>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <FormatSizeIcon />
          </Avatar>
        </ListItemAvatar>
        <FontSizeSlider />
      </ListItem>
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
          toggleAnnotateScheduled();
        }}
      >
        <ListItemAvatar>
          <Avatar>
            <PinIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={t("注釋預定班次")}
          secondary={t(annotateScheduled ? "開啟" : "關閉")}
        />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          vibrate(vibrateDuration);
          togglePlatformMode();
        }}
      >
        <ListItemAvatar>
          <Avatar>
            <LooksOneRoundedIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={t("月台顯示格式")}
          secondary={t(platformMode ? "➊" : "①")}
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
          toggleIsRecentSearchShown();
        }}
      >
        <ListItemAvatar>
          <Avatar>
            {isRecentSearchShown ? <UpdateIcon /> : <UpdateDisabledIcon />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={t("搜尋記錄")}
          secondary={t(isRecentSearchShown ? "開啟" : "關閉")}
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
          if (window.confirm(t("確定清空？"))) {
            resetUsageRecord();
          }
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
