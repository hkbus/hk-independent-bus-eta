import { useContext, useMemo, useState } from "react";
import {
  Box,
  Button,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Check as CheckIcon } from "@mui/icons-material";
import SyncContext from "../context/SyncContext";
import { parseToken } from "../utils/syncApi";

// The token lives in the URL fragment (#TOKEN), never the path — GA and
// most analytics/proxy logs record the path but not the fragment.
const tokenFromHash = (): string =>
  window.location.hash ? parseToken(window.location.hash.slice(1)) : "";

const SyncPairPage = () => {
  const [tokenParam] = useState<string>(tokenFromHash);
  const { t } = useTranslation();
  const { isConfigured, isEnabled, joinSyncGroup } = useContext(SyncContext);
  const navigate = useNavigate();
  const [manualInput, setManualInput] = useState<string>(tokenParam);
  const [joined, setJoined] = useState(false);

  const token = useMemo(
    () => parseToken(tokenParam || manualInput),
    [tokenParam, manualInput]
  );

  const confirm = () => {
    if (!token) return;
    joinSyncGroup(token);
    setJoined(true);
    setTimeout(() => navigate("/"), 1200);
  };

  if (!isConfigured) {
    return (
      <Box sx={rootSx}>
        <Typography variant="body2" color="text.secondary">
          {t("同步功能尚未啟用")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={rootSx}>
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        {t("加入同步群組")}
      </Typography>
      {!tokenParam && (
        <TextField
          variant="outlined"
          value={manualInput}
          onChange={({ target: { value } }) => setManualInput(value)}
          fullWidth
          label={t("連結或代碼")}
        />
      )}
      {joined ? (
        <Typography>{t("已加入同步群組，正在同步...")}</Typography>
      ) : (
        <>
          {isEnabled && (
            <Typography variant="body2" color="text.secondary">
              {t("此裝置已加入另一個同步群組，繼續將會轉為加入這個新群組。")}
            </Typography>
          )}
          <Button
            startIcon={<CheckIcon />}
            variant="outlined"
            disabled={!token}
            onClick={confirm}
            sx={buttonSx}
          >
            {t("確定")}
          </Button>
        </>
      )}
    </Box>
  );
};

export default SyncPairPage;

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  flex: 1,
  gap: 1,
  m: 1,
};

const buttonSx: SxProps<Theme> = {
  color: (t) =>
    t.palette.mode === "light"
      ? t.palette.text.primary
      : t.palette.primary.main,
  borderColor: (t) =>
    t.palette.mode === "light"
      ? t.palette.text.primary
      : t.palette.primary.main,
};
