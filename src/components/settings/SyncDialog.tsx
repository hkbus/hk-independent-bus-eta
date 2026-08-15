import { useContext, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Snackbar,
  TextField,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowBackIosNew as BackIcon,
  QrCode2 as QrCodeIcon,
  ContentPaste as JoinIcon,
  ContentCopy as ContentCopyIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudSync as CloudSyncIcon,
  ErrorOutline as ErrorOutlineIcon,
  ExitToApp as LeaveIcon,
} from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import SyncContext from "../../context/SyncContext";
import useLanguage from "../../hooks/useTranslation";

interface SyncDialogProps {
  open: boolean;
  onClose: () => void;
}

type TabType = "overview" | "create" | "join";

const parseToken = (input: string): string => {
  const trimmed = input.trim();
  const match = trimmed.match(/\/sync\/([A-Z2-7]+)\/?$/i);
  return (match ? match[1] : trimmed).toUpperCase();
};

const SyncDialog = ({ open, onClose }: SyncDialogProps) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const {
    isEnabled,
    status,
    lastSyncedAt,
    token,
    createSyncGroup,
    joinSyncGroup,
    leaveSyncGroup,
    syncNow,
  } = useContext(SyncContext);
  const [tab, setTab] = useState<TabType>("overview");
  const [joinInput, setJoinInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const handleClose = () => {
    onClose();
    setTab("overview");
    setJoinInput("");
    setConfirmLeave(false);
  };

  const pairUrl = useMemo(
    () =>
      token
        ? `https://${window.location.hostname}/${language}/sync/${token}`
        : "",
    [token, language]
  );

  const statusIcon = useMemo(() => {
    if (!isEnabled) return <CloudOffIcon />;
    if (status === "syncing") return <CloudSyncIcon />;
    if (status === "error") return <ErrorOutlineIcon />;
    return <CloudDoneIcon />;
  }, [isEnabled, status]);

  const statusText = useMemo(() => {
    if (!isEnabled) return t("尚未加入同步群組");
    if (status === "syncing") return t("同步中...");
    if (status === "error") return t("同步失敗，請檢查網絡連線");
    if (lastSyncedAt) {
      return (
        t("上次同步") +
        ": " +
        new Date(lastSyncedAt).toLocaleString(undefined, { hour12: false })
      );
    }
    return t("從未同步");
  }, [isEnabled, status, lastSyncedAt, t]);

  return (
    <Dialog
      PaperProps={{ sx: DialogSx }}
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={DialogTitleSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {tab !== "overview" && (
            <IconButton onClick={() => setTab("overview")}>
              <BackIcon />
            </IconButton>
          )}
          {t("同步群組")}
        </Box>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />

      {tab === "overview" && (
        <Box sx={contentSx}>
          <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
            {t(
              "讓多部裝置共用同一組收藏（車站、到站預報、集合）及個人化設定。掃描QR碼即可加入。"
            )}
          </Typography>
          {isEnabled ? (
            <List sx={{ py: 0 }}>
              <ListItem
                sx={{ flexDirection: "column", alignItems: "flex-start" }}
              >
                <Typography variant="caption" color="text.secondary">
                  {t("同步代碼")}
                </Typography>
                <Box
                  sx={{
                    mt: 0.5,
                    px: 1.5,
                    py: 1,
                    width: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    fontFamily:
                      "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
                    fontSize: "0.95rem",
                    letterSpacing: "0.06em",
                    wordBreak: "break-all",
                  }}
                >
                  {token}
                </Box>
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>{statusIcon}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={statusText} />
              </ListItem>
              <ListItemButton onClick={() => syncNow()}>
                <ListItemAvatar>
                  <Avatar>
                    <CloudSyncIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={t("立即同步")} />
              </ListItemButton>
              <ListItemButton onClick={() => setTab("create")}>
                <ListItemAvatar>
                  <Avatar>
                    <QrCodeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={t("顯示QR碼以加入其他裝置")} />
              </ListItemButton>
              {confirmLeave ? (
                <ListItem>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    <Typography variant="body2">
                      {t(
                        "離開後，此裝置的收藏及設定將不再與其他裝置同步，但不會刪除任何裝置上的資料。"
                      )}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => {
                          leaveSyncGroup();
                          setConfirmLeave(false);
                        }}
                      >
                        {t("確定離開")}
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => setConfirmLeave(false)}
                      >
                        {t("不離開")}
                      </Button>
                    </Box>
                  </Box>
                </ListItem>
              ) : (
                <ListItemButton onClick={() => setConfirmLeave(true)}>
                  <ListItemAvatar>
                    <Avatar>
                      <LeaveIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={t("離開同步群組")} />
                </ListItemButton>
              )}
            </List>
          ) : (
            <List sx={{ py: 0 }}>
              <ListItemButton
                onClick={() => {
                  createSyncGroup();
                  setTab("create");
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <QrCodeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={t("建立同步群組")}
                  secondary={t("在這部裝置開始，之後可讓其他裝置加入")}
                />
              </ListItemButton>
              <ListItemButton onClick={() => setTab("join")}>
                <ListItemAvatar>
                  <Avatar>
                    <JoinIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={t("加入同步群組")}
                  secondary={t("掃描或貼上其他裝置的QR碼/代碼")}
                />
              </ListItemButton>
            </List>
          )}
        </Box>
      )}

      {tab === "create" && (
        <Box sx={{ ...contentSx, alignItems: "center", px: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t("讓其他裝置掃描此QR碼以加入同步群組")}
          </Typography>
          {pairUrl && (
            <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 1 }}>
              <QRCodeSVG value={pairUrl} size={200} />
            </Box>
          )}
          <Typography variant="body2" color="text.secondary">
            {t("或分享以下連結")}
          </Typography>
          <TextField
            variant="outlined"
            value={pairUrl}
            fullWidth
            spellCheck={false}
            size="small"
          />
          <Button
            startIcon={<ContentCopyIcon />}
            variant="outlined"
            fullWidth
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: t("同步群組"), url: pairUrl });
              } else {
                navigator.clipboard?.writeText(pairUrl).then(() => {
                  setIsCopied(true);
                });
              }
            }}
          >
            {t("複製連結")}
          </Button>
        </Box>
      )}

      {tab === "join" && (
        <Box sx={{ ...contentSx, px: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t(
              "在另一部裝置的「同步群組」中顯示QR碼，然後用相機應用程式掃描；或直接貼上連結/代碼。"
            )}
          </Typography>
          <TextField
            variant="outlined"
            value={joinInput}
            onChange={({ target: { value } }) => setJoinInput(value)}
            fullWidth
            label={t("連結或代碼")}
          />
          <Button
            variant="outlined"
            fullWidth
            disabled={joinInput.trim() === ""}
            onClick={() => {
              joinSyncGroup(parseToken(joinInput));
              setTab("overview");
              setJoinInput("");
            }}
          >
            {t("加入")}
          </Button>
        </Box>
      )}

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isCopied}
        autoHideDuration={1500}
        onClose={() => setIsCopied(false)}
        message={t("已複製到剪貼簿")}
      />
    </Dialog>
  );
};

export default SyncDialog;

const DialogSx: SxProps<Theme> = {
  height: "100%",
};

const DialogTitleSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const contentSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  py: 2,
};
