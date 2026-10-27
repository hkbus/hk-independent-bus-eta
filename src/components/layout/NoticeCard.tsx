import {
  Box,
  Button,
  ButtonBase,
  Drawer,
  IconButton,
  Paper,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import WarnIcon from "@mui/icons-material/Warning";
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import useLanguage from "../../hooks/useTranslation";
import { useCallback, useContext, useEffect, useState } from "react";
import { iOSRNWebView } from "../../utils";
import { Language } from "../../data";
import AppContext from "../../context/AppContext";

interface NoticeCardState {
  id: string;
  content: Record<Language, string[]>;
  url: string;
  link: Record<Language, string>;
  enableLinkInIos: boolean;
  startDate: Date;
  endDate: Date;
  isShown: boolean;
  probability?: number;
  icon?: "info" | "warning";
}

// One-line strip: costs the ETA list a single row. The full text opens in a
// sheet, so there is no carousel to compete with the home tabs' own swipe.
const NoticeCard = () => {
  const language = useLanguage();
  const { t } = useTranslation();
  const [state, setState] = useState<NoticeCardState[]>([]);
  const [viewIdx, setViewIdx] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [closeNoticeIds, setCloseNoticeIds] = useState<string[]>(
    JSON.parse(localStorage.getItem("closeNoticeIds") ?? "[]")
  );
  const { openUrl } = useContext(AppContext);

  const closeNotice = useCallback(
    ({ id, probability }: NoticeCardState) =>
      () => {
        setViewIdx((prev) => Math.max(prev - 1, 0));
        if (probability === undefined) {
          setCloseNoticeIds((prev) => [...prev, id]);
          return;
        }
        rolled.set(id, false);
        setState((prev) => prev.filter((notice) => notice.id !== id));
      },
    []
  );

  useEffect(() => {
    fetch("https://notice.hkbus.app/notices.json")
      .then((r) => r.json())
      .then((r: NoticeCardState[]) =>
        setState(
          r
            .filter(
              ({ id, probability }) =>
                probability !== undefined || !closeNoticeIds.includes(id)
            ) // backward compatability, remove "probability !== undefined" after 2027 (assume all apps updated)
            .map((notice) => ({
              ...notice,
              startDate: notice.startDate
                ? new Date(notice.startDate)
                : new Date(),
              endDate: new Date(notice.endDate),
            }))
            .filter((notice) => notice.startDate <= new Date())
            .filter((notice) => notice.endDate >= new Date())
            .filter(({ id, probability }) => {
              if (!rolled.has(id))
                rolled.set(id, Math.random() < (probability ?? 1));
              return rolled.get(id);
            })
        )
      )
      .finally(() => {
        localStorage.setItem("closeNoticeIds", JSON.stringify(closeNoticeIds));
      });
  }, [closeNoticeIds]);

  // nothing left to show: make sure a sheet that was open goes away with it
  useEffect(() => {
    if (state.length === 0) setOpen(false);
  }, [state.length]);

  if (
    state.length === 0 ||
    viewIdx >= state.length ||
    !state.reduce((acc, cur) => acc || cur.isShown, false)
  ) {
    return null;
  }

  const notice = state[viewIdx];
  const lines = notice.content[language] ?? [];
  const link = notice.link?.[language];
  const canOpenLink =
    Boolean(link) && !(iOSRNWebView() && !notice.enableLinkInIos);

  return (
    <>
      <Paper variant="outlined" sx={stripSx}>
        <ButtonBase
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          sx={stripButtonSx}
        >
          <WarnIcon color="warning" fontSize="small" />
          <Typography variant="subtitle2" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {lines[0]}
          </Typography>
          {state.length > 1 && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ fontVariantNumeric: "tabular-nums" }}
            >
              {viewIdx + 1}/{state.length}
            </Typography>
          )}
          <NextIcon fontSize="small" />
        </ButtonBase>
        <IconButton
          aria-label={t("關閉通知")}
          onClick={closeNotice(notice.id)}
          sx={closeSx}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
      <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)}>
        <Box sx={sheetSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarnIcon color="warning" fontSize="small" />
            <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 700 }}>
              {t("通告")}
            </Typography>
            {state.length > 1 && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {viewIdx + 1}/{state.length}
              </Typography>
            )}
          </Box>
          <Box sx={{ overflow: "auto" }}>
            {lines.map((v, idx) => (
              <Typography key={`_notice-${idx}`} variant="body2" paragraph>
                {v}
              </Typography>
            ))}
          </Box>
          <Box sx={actionsSx}>
            {state.length > 1 && (
              <>
                <IconButton
                  aria-label={t("上一則")}
                  disabled={viewIdx === 0}
                  onClick={() => setViewIdx((i) => Math.max(i - 1, 0))}
                  sx={navSx}
                >
                  <PrevIcon />
                </IconButton>
                <IconButton
                  aria-label={t("下一則")}
                  disabled={viewIdx >= state.length - 1}
                  onClick={() =>
                    setViewIdx((i) => Math.min(i + 1, state.length - 1))
                  }
                  sx={navSx}
                >
                  <NextIcon />
                </IconButton>
              </>
            )}
            <Box sx={{ flex: 1 }} />
            {canOpenLink && (
              <Button
                variant="outlined"
                sx={{ minHeight: 44 }}
                onClick={() => openUrl(link)}
              >
                {t("開啟連結")}
              </Button>
            )}
            <Button
              sx={{ minHeight: 44 }}
              onClick={() => {
                closeNotice(notice.id)();
                if (state.length <= 1) setOpen(false);
              }}
            >
              {t("關閉通知")}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default NoticeCard;

const stripSx: SxProps<Theme> = {
  borderRadius: (theme) => theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  textAlign: "left",
  pl: 2,
};

const stripButtonSx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  minHeight: 44,
  display: "flex",
  justifyContent: "flex-start",
  gap: 1,
};

const closeSx: SxProps<Theme> = {
  minWidth: 44,
  minHeight: 44,
};

const sheetSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  p: 2,
  pb: "max(16px, env(safe-area-inset-bottom))",
  maxHeight: "70dvh",
};

const actionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

const navSx: SxProps<Theme> = {
  minWidth: 44,
  minHeight: 44,
};
