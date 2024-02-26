import React, { useContext, useState } from "react";
import EmotionContext from "../EmotionContext";
import { Paper, SxProps, Theme } from "@mui/material";
import EmotionTabbar, {
  EmotionTabType,
} from "../components/emotion/EmotionTabbar";

const Emotion = () => {
  const { isRemind } = useContext(EmotionContext);
  const [tab, setTab] = useState<EmotionTabType>(
    isRemind ? "check in" : "chart"
  );

  return (
    <Paper sx={paperSx}>
      <EmotionTabbar value={tab} onChange={(v) => setTab(v)} />
    </Paper>
  );
};

export default Emotion;

const paperSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  width: "100%",
  height: "100%",
};
