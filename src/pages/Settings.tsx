import React, { useContext, useEffect, useState, useMemo } from "react";
import AppContext from "../AppContext";
import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Paper,
  Snackbar,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import {
  GetApp as GetAppIcon,
  Build as BuildIcon,
  LocationOn as LocationOnIcon,
  LocationOff as LocationOffIcon,
  MonetizationOn as MonetizationOnIcon,
  DataUsage as DataUsageIcon,
  GitHub as GitHubIcon,
  Share as ShareIcon,
  Telegram as TelegramIcon,
  Fingerprint as FingerprintIcon,
  Gavel as GavelIcon,
  InsertEmoticon as InsertEmoticonIcon,
  SsidChart as SsidChartIcon,
  BarChart as BarChartIcon,
  Info as InfoIcon,
  SendToMobile as SendToMobileIcon,
  HelpOutline as HelpIcon,
  Sync as SyncIcon,
  SyncDisabled as SyncDisabledIcon,
  SecurityUpdate as SecurityUpdateIcon,
  Watch as WatchIcon,
} from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import { useTranslation } from "react-i18next";
import {
  vibrate,
  setSeoHeader,
  triggerShare,
  checkAppInstalled,
  iOSRNWebView,
} from "../utils";
import InstallDialog from "../components/settings/InstallDialog";
import Donations from "../Donations";
import PersonalizeDialog from "../components/settings/PersonalizeDialog";
import { useNavigate } from "react-router-dom";
import ReactNativeContext from "../ReactNativeContext";

const Settings = () => {
  const {
    AppTitle,
    db: { schemaVersion, versionMd5, updateTime },
    renewDb,
    autoRenew,
    toggleAutoDbRenew,
    geoPermission,
    updateGeoPermission,
    vibrateDuration,
    toggleAnalytics,
    analytics,
  } = useContext(AppContext);
  const { debug, toggleDebug } = useContext(ReactNativeContext);
  const { os } = useContext(ReactNativeContext);
  const [updating, setUpdating] = useState(false);
  const [showGeoPermissionDenied, setShowGeoPermissionDenied] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isOpenInstallDialog, setIsOpenInstallDialog] = useState(false);
  const [isPersonalizeDialog, setIsPersonalizeDialog] = useState(false);

  const { t, i18n } = useTranslation();
  const donationId = useMemo(
    () => Math.floor(Math.random() * Donations.length),
    []
  );
  const isApple =
    os === "ios" || /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);

  const navigate = useNavigate();

  useEffect(() => {
    setSeoHeader({
      title: t("設定") + " - " + t(AppTitle),
      description: t("setting-page-description"),
      lang: i18n.language,
    });
    setUpdating(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateTime, i18n.language]);

  return (
    <Paper sx={rootSx} square elevation={0}>
      <Typography component="h1" style={visuallyHidden}>{`${t("設定")} - ${t(
        AppTitle
      )}`}</Typography>
      <List sx={{ py: 0 }}>
        {!checkAppInstalled() && !iOSRNWebView() && (
          <ListItemButton
            onClick={() => {
              vibrate(vibrateDuration);
              setTimeout(() => setIsOpenInstallDialog(true), 0);
            }}
          >
            <ListItemAvatar>
              <Avatar>
                <GetAppIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t("安裝")}
              secondary={t("安裝巴士預報 App 到裝置")}
            />
          </ListItemButton>
        )}
        {(process.env.REACT_APP_COMMIT_HASH ||
          process.env.REACT_APP_VERSION) && (
          <ListItemButton
            component="a"
            href={`${
              process.env.REACT_APP_REPO_URL ||
              "https://github.com/hkbus/hk-independent-bus-eta"
            }${
              process.env.REACT_APP_COMMIT_HASH
                ? `/commit/${process.env.REACT_APP_COMMIT_HASH}`
                : ""
            }`}
            target="_blank"
            rel="noreferrer"
          >
            <ListItemAvatar>
              <Avatar>
                <InfoIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${t("版本")}: ${
                process.env.REACT_APP_VERSION || "unknown"
              }${
                process.env.REACT_APP_COMMIT_HASH
                  ? ` - ${process.env.REACT_APP_COMMIT_HASH}`
                  : ""
              }`}
              secondary={process.env.REACT_APP_COMMIT_MESSAGE || ""}
            />
          </ListItemButton>
        )}
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            setUpdating(true);
            renewDb();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <BuildIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              `${t("更新路線資料庫")}: ` +
              `${schemaVersion} - ${versionMd5.slice(0, 6)}`
            }
            secondary={
              t("更新時間") +
              ": " +
              new Date(updateTime)
                .toLocaleString()
                .slice(0, 20)
                .replace(",", " ")
            }
          />
        </ListItemButton>
        <Divider />
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            if (geoPermission === "granted") {
              updateGeoPermission("closed");
            } else {
              updateGeoPermission("opening", () => {
                setShowGeoPermissionDenied(true);
              });
            }
          }}
        >
          <ListItemAvatar>
            <Avatar>
              {geoPermission === "granted" ? (
                <LocationOnIcon />
              ) : (
                <LocationOffIcon />
              )}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            // @ts-ignore
            primary={t("地理位置定位功能")}
            secondary={t(
              geoPermission === "granted"
                ? "開啟"
                : geoPermission === "opening"
                  ? "開啟中..."
                  : "關閉"
            )}
          />
        </ListItemButton>
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            toggleAutoDbRenew();
          }}
        >
          <ListItemAvatar>
            <Avatar>{autoRenew ? <SyncIcon /> : <SyncDisabledIcon />}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("自動更新路線資料")}
            secondary={t(autoRenew ? "開啟" : "關閉")}
          />
        </ListItemButton>
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            setIsPersonalizeDialog(true);
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <InsertEmoticonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("個性化設定")}
            secondary={t("日夜模式、時間格式、路線次序等")}
          />
        </ListItemButton>
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            navigate(`/${i18n.language}/export`);
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <SendToMobileIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("資料匯出")} />
        </ListItemButton>
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            navigate(`/${i18n.language}/import`);
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <SecurityUpdateIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("資料匯入")} />
        </ListItemButton>
        <Divider />
        <ListItemButton
          onClick={() => {
            vibrate(vibrateDuration);
            triggerShare(
              `https://${window.location.hostname}`,
              t("巴士到站預報 App")
            ).then(() => {
              if (navigator.clipboard) setIsCopied(true);
            });
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <ShareIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("複製應用程式鏈結")}
            secondary={t("經不同媒介分享給親友")}
          />
        </ListItemButton>
        <ListItemButton
          component={"a"}
          href={
            isApple ? `https://watch.hkbus.app/` : `https://wear.hkbus.app/`
          }
          target="_blank"
          onClick={() => {
            vibrate(vibrateDuration);
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <WatchIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("智能手錶應用程式")} />
        </ListItemButton>
        {!iOSRNWebView() ? (
          <ListItemButton
            component="a"
            href={`https://t.me/hkbusapp`}
            target="_blank"
            onClick={() => {
              vibrate(vibrateDuration);
            }}
          >
            <ListItemAvatar>
              <Avatar>
                <TelegramIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t("Telegram 交流區")}
              secondary={t("歡迎意見及技術交流")}
            />
          </ListItemButton>
        ) : (
          <ListItemButton
            onClick={() => {
              vibrate(vibrateDuration);
              navigate(`/${i18n.language}/support`);
            }}
          >
            <ListItemAvatar>
              <Avatar>
                <HelpIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t("協助")}
              secondary={t("歡迎意見及技術交流")}
            />
          </ListItemButton>
        )}
        {!iOSRNWebView() && (
          <ListItemButton onClick={toggleAnalytics}>
            <ListItemAvatar>
              <Avatar>
                <BarChartIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={"Google Analytics"}
              secondary={t(analytics ? "開啟" : "關閉")}
            />
          </ListItemButton>
        )}
        <ListItemButton
          component="a"
          href={`https://datastudio.google.com/embed/reporting/de590428-525e-4865-9d37-a955204b807a/page/psfZC`}
          target="_blank"
          onClick={() => {
            vibrate(vibrateDuration);
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <SsidChartIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("統計數據彙整")}
            secondary={t("整理從 Google 收集的數據")}
          />
        </ListItemButton>
        {!iOSRNWebView() && (
          <ListItemButton
            component="a"
            href={Donations[donationId].url[i18n.language]}
            target="_blank"
            onClick={() => {
              vibrate(vibrateDuration);
            }}
          >
            <ListItemAvatar>
              <Avatar>
                <MonetizationOnIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t("捐款支持")}
              secondary={Donations[donationId].description[i18n.language]}
            />
          </ListItemButton>
        )}
        <Divider />
        <ListItemButton
          component={"a"}
          href={
            process.env.REACT_APP_REPO_URL ||
            `https://github.com/hkbus/hk-independent-bus-eta`
          }
          target="_blank"
          onClick={() => {
            vibrate(vibrateDuration);
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <GitHubIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("Source code")}
            secondary={"GPL-3.0 License"}
          />
        </ListItemButton>
        <ListItemButton
          component={"a"}
          href={`https://instagram.com/chan_gua`}
          target="_blank"
          onClick={() => {
            vibrate(vibrateDuration);
          }}
        >
          <ListItemAvatar>
            <Avatar sx={iconSx} src="/img/logo128.png" alt="App Logo"></Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("圖標來源")} secondary={"Mavis 雞蛋妹"} />
        </ListItemButton>
        <ListItemButton
          component={"a"}
          href={`/${i18n.language}/privacy`}
          onClick={() => {
            vibrate(vibrateDuration);
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <FingerprintIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("隱私權聲明")} />
        </ListItemButton>
        <ListItemButton
          component={"a"}
          href={`/${i18n.language}/terms`}
          onClick={() => {
            vibrate(vibrateDuration);
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <GavelIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={t("條款")} />
        </ListItemButton>
        <ListItem onClick={toggleDebug}>
          <ListItemAvatar>
            <Avatar>
              <DataUsageIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("交通資料來源") + ` ${debug === true ? "DEBUG" : ""}`}
            secondary={t("資料一線通") + "  https://data.gov.hk"}
          />
        </ListItem>
      </List>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={updating}
        message={t("資料更新中") + "..."}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={showGeoPermissionDenied}
        autoHideDuration={1500}
        onClose={(e, reason) => {
          setShowGeoPermissionDenied(false);
        }}
        message={t("無法獲得地理位置定位功能權限")}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isCopied}
        autoHideDuration={1500}
        onClose={(event, reason) => {
          setIsCopied(false);
        }}
        message={t("鏈結已複製到剪貼簿")}
      />
      <InstallDialog
        open={isOpenInstallDialog}
        handleClose={() => setIsOpenInstallDialog(false)}
      />
      <PersonalizeDialog
        open={isPersonalizeDialog}
        onClose={() => setIsPersonalizeDialog(false)}
      />
    </Paper>
  );
};

export default Settings;

const rootSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
  height: "calc(100vh - 120px)",
  overflowY: "scroll",
  "& .MuiAvatar-colorDefault": {
    color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
  },
};

const iconSx: SxProps<Theme> = {
  filter: (theme) =>
    theme.palette.mode === "dark" ? "grayscale(100%) brightness(0.5)" : "none",
};
