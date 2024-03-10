import { Box, Paper, SxProps, Theme } from "@mui/material";
import CheckIn from "../components/emotion/CheckIn";
import { useParams } from "react-router-dom";
import { Suspense } from "react";
import EmotionChart from "../components/emotion/EmotionChart";
import EmotionTabbar from "../components/emotion/EmotionTabbar";

const EmotionPage = () => {
  const { tab } = useParams();

  return (
    <Paper sx={paperSx}>
      <EmotionTabbar />
      <Suspense fallback={<></>}>
        <Box overflow="auto">
          {(!tab || tab === "check-in") && <CheckIn />}
          {tab === "chart" && <EmotionChart />}
        </Box>
      </Suspense>
    </Paper>
  );
};

export default EmotionPage;

const paperSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  overflow: "none",
  width: "100%",
  height: "100%",
};
