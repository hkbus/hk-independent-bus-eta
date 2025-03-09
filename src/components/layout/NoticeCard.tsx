import { Box, Paper, SxProps, Theme, Typography } from "@mui/material";
import WarnIcon from "@mui/icons-material/Warning";
import useLanguage from "../../hooks/useTranslation";
import { useCallback, useEffect, useState } from "react";
import { iOSRNWebView } from "../../utils";
import { Language } from "../../data";

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

  useEffect(() => {
    fetch("/notice.json")
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
    window.open(state.link[language], "_target");
  }, [language, state]);

  if (state === null || !state.isShown || state.endDate < new Date()) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={rootSx} onClick={handleClick}>
      <WarnIcon color="warning" />
      <Box>
        {state.content[language].map((v, idx) => (
          <Typography key={`_notice-${idx}`} variant="subtitle2">
            {v}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};

export default NoticeCard;

const rootSx: SxProps<Theme> = {
  borderRadius: (theme) => theme.shape.borderRadius,
  cursor: "pointer",
  px: 2,
  py: 1,
  alignItems: "center",
  textAlign: "left",
  gap: 2,
  display: "flex",
};
