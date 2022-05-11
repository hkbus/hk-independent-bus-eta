import React, { useContext, useEffect, useState } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
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
} from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import { useTranslation } from "react-i18next";
import {
  vibrate,
  setSeoHeader,
  triggerShare,
  checkAppInstalled,
} from "../utils";
import InstallDialog from "../components/settings/InstallDialog";
import Donations from "../Donations";
import PersonalizeDialog from "../components/settings/PersonalizeDialog";

const Settings = () => {
  const {
    AppTitle,
    db: { schemaVersion, versionMd5, updateTime },
    renewDb,
    geoPermission,
    updateGeoPermission,
    vibrateDuration,
  } = useContext(AppContext);
  const [updating, setUpdating] = useState(false);
  const [showGeoPermissionDenied, setShowGeoPermissionDenied] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isOpenInstallDialog, setIsOpenInstallDialog] = useState(false);
  const [isPersonalizeDialog, setIsPersonalizeDialog] = useState(false);

  const { t, i18n } = useTranslation();
  const donationId = Math.floor(Math.random() * Donations.length);

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
    <Root className={classes.root} square elevation={0}>
      <Typography component="h1" style={visuallyHidden}>{`${t("設定")} - ${t(
        AppTitle
      )}`}</Typography>
      <List>
        {!checkAppInstalled() && (
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
              secondaryTypographyProps={{ component: "h3", variant: "body2" }}
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
              `${t("架構版本")}: ` +
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
            secondaryTypographyProps={{ component: "h3", variant: "body2" }}
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
            primary={t("地理位置定位功能")}
            secondary={t(
              geoPermission === "granted"
                ? "開啟"
                : geoPermission === "opening"
                ? "開啟中..."
                : "關閉"
            )}
            secondaryTypographyProps={{ component: "h3", variant: "body2" }}
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
          <ListItemText primary={t("個性化設定")} />
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
            secondaryTypographyProps={{ component: "h3", variant: "body2" }}
          />
        </ListItemButton>
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
            secondaryTypographyProps={{ component: "h3", variant: "body2" }}
          />
        </ListItemButton>
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
            secondaryTypographyProps={{ component: "h3", variant: "body2" }}
          />
        </ListItemButton>
        <Divider />
        <ListItemButton
          component={"a"}
          href={`https://github.com/hkbus/hk-independent-bus-eta`}
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
            secondaryTypographyProps={{ component: "h3", variant: "body2" }}
          />
        </ListItemButton>
        <ListItemButton
          component={"a"}
          href={`https://www.flaticon.com/free-icon/double-decker_1032967`}
          target="_blank"
          onClick={() => {
            vibrate(vibrateDuration);
          }}
        >
          <ListItemAvatar>
            <Avatar
              className={classes.icon}
              src="/logo128.png"
              alt="App Logo"
            ></Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("圖標來源")}
            secondary={"Freepik from Flaticon"}
            secondaryTypographyProps={{ component: "h3", variant: "body2" }}
          />
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
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <DataUsageIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("交通資料來源")}
            secondary={t("資料一線通") + "  https://data.gov.hk"}
            secondaryTypographyProps={{ component: "h3", variant: "body2" }}
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
        handleClose={() => setIsPersonalizeDialog(false)}
      />
    </Root>
  );
};

export default Settings;

const PREFIX = "settings";

const classes = {
  root: `${PREFIX}-root`,
  icon: `${PREFIX}-icon`,
};

const Root = styled(Paper)(({ theme }) => ({
  [`&.${classes.root}`]: {
    background:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
    height: "calc(100vh - 120px)",
    overflowY: "scroll",
    "& .MuiAvatar-colorDefault": {
      color:
        theme.palette.mode === "dark"
          ? theme.palette.background.default
          : "white",
    },
  },
  [`& .${classes.icon}`]: {
    filter:
      theme.palette.mode === "dark"
        ? "grayscale(100%) brightness(0.5)"
        : "none",
  },
}));
