import {
  Box,
  IconButton,
  Paper,
  SxProps,
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

interface NoticeCardState {
  content: Record<Language, string[]>;
  url: string;
  link: Record<Language, string>;
  enableLinkInIos: boolean;
  endDate: Date;
  isShown: boolean;
}

const NoticeCard = () => {
  const language = useLanguage();
  const [state, setState] = useState<NoticeCardState | null>(null);
  const [closeNoticeContent, setCloseNoticeContent] = useState<string>(
    localStorage.getItem("closeNoticeContent") ?? ""
  );
  const { openUrl } = useContext(AppContext);

  useEffect(() => {
    fetch("https://notice.hkbus.app/notice.json")
      .then((r) => r.json())
      .then((r) =>
        setState({
          ...r,
          endDate: new Date(r.endDate),
        })
      );
  }, []);

  const handleClick = useCallback(() => {
    if (state === null) return;
    if (iOSRNWebView() && !state.enableLinkInIos) {
      return;
    }
    openUrl(state.link[language]);
  }, [language, openUrl, state]);

  const closeNotice = useCallback(() => {
    if (state) {
      localStorage.setItem("closeNoticeContent", JSON.stringify(state.content));
      setCloseNoticeContent(JSON.stringify(state.content));
    }
  }, [state]);

  if (
    state === null ||
    closeNoticeContent === JSON.stringify(state.content) ||
    !state.isShown ||
    state.endDate < new Date()
  ) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={rootSx}>
      <WarnIcon color="warning" />
      <Box onClick={handleClick} sx={{ cursor: "pointer" }}>
        {state.content[language].map((v, idx) => (
          <Typography key={`_notice-${idx}`} variant="subtitle2">
            {v}
          </Typography>
        ))}
      </Box>
      <IconButton size="small" onClick={closeNotice}>
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
