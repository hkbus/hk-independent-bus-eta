import {
  Box,
  IconButton,
  Paper,
  SxProps,
  Tab,
  Tabs,
  Theme,
  Typography,
} from "@mui/material";
import WarnIcon from "@mui/icons-material/Warning";
import useLanguage from "../../hooks/useTranslation";
import { useCallback, useContext, useEffect, useState } from "react";
import { iOSRNWebView } from "../../utils";
import { Language } from "../../data";
import { Close as CloseIcon } from "@mui/icons-material";
import AppContext from "../../context/AppContext";
import SwipeableViews from "react-swipeable-views";

interface NoticeCardState {
  id: string;
  content: Record<Language, string[]>;
  url: string;
  link: Record<Language, string>;
  enableLinkInIos: boolean;
  startDate: Date;
  endDate: Date;
  isShown: boolean;
}

const NoticeCard = () => {
  const language = useLanguage();
  const [state, setState] = useState<NoticeCardState[]>([]);
  const [viewIdx, setViewIdx] = useState<number>(0);
  const [closeNoticeIds, setCloseNoticeIds] = useState<string[]>(
    JSON.parse(localStorage.getItem("closeNoticeIds") ?? "[]")
  );
  const { openUrl } = useContext(AppContext);

  const handleClick = useCallback(
    (idx: number) => () => {
      if (idx >= state.length) return;
      if (iOSRNWebView() && !state[idx].enableLinkInIos) {
        return;
      }
      openUrl(state[idx].link[language]);
    },
    [language, openUrl, state]
  );

  const closeNotice = useCallback(
    (id: string) => () => {
      setCloseNoticeIds((prev) => [...prev, id]);
    },
    []
  );

  useEffect(() => {
    fetch("https://notice.hkbus.app/notices.json")
      .then((r) => r.json())
      .then((r: NoticeCardState[]) =>
        setState(
          r
            .filter(({ id }) => !closeNoticeIds.includes(id))
            .map((notice) => ({
              ...notice,
              startDate: notice.startDate
                ? new Date(notice.startDate)
                : new Date(),
              endDate: new Date(notice.endDate),
            }))
            .filter((notice) => notice.startDate <= new Date())
            .filter((notice) => notice.endDate >= new Date())
        )
      )
      .finally(() => {
        localStorage.setItem("closeNoticeIds", JSON.stringify(closeNoticeIds));
      });
  }, [closeNoticeIds]);

  if (
    state.length === 0 ||
    !state.reduce((acc, cur) => acc || cur.isShown, false)
  ) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={rootSx}>
      <Box
        display="flex"
        justifyContent="flex-start"
        flexDirection="column"
        gap={0.5}
        overflow="scroll"
      >
        <Tabs
          sx={noticeTabsSx}
          value={viewIdx}
          onChange={(_, v) => setViewIdx(v)}
        >
          {state.map((_, idx) => (
            <Tab key={`notice-tab-${idx}`} label={""} value={idx} />
          ))}
        </Tabs>
        <SwipeableViews
          index={viewIdx}
          onChangeIndex={(idx) => {
            setViewIdx(idx);
          }}
        >
          {state.map((notice) => (
            <Box display="flex" alignItems="center" gap={2} key={notice.id}>
              <WarnIcon color="warning" />
              <Box onClick={handleClick(viewIdx)} sx={{ cursor: "pointer" }}>
                {notice.content[language].map((v, idx) => (
                  <Typography
                    key={`_notice-${idx}`}
                    variant="subtitle2"
                    sx={{ height: "3.14em", overflowY: "auto" }}
                  >
                    {v}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </SwipeableViews>
      </Box>
      <IconButton size="small" onClick={closeNotice(state[viewIdx].id)}>
        <CloseIcon />
      </IconButton>
    </Paper>
  );
};

export default NoticeCard;

const rootSx: SxProps<Theme> = {
  borderRadius: (theme) => theme.shape.borderRadius,
  px: 2,
  py: 1,
  alignItems: "center",
  textAlign: "left",
  gap: 2,
  display: "flex",
};

const noticeTabsSx: SxProps<Theme> = {
  minHeight: 5,
  ["& .MuiTab-root"]: {
    px: 0,
    py: 0,
    height: 5,
    borderBottom: "#7777 1px solid",
    minHeight: 5,
    mx: 1,
  },
};
