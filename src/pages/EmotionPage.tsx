import { Box, Paper, SxProps, Theme } from "@mui/material";
import CheckIn from "../components/emotion/CheckIn";
import EmotionChart from "../components/emotion/EmotionChart";
import { useParams } from "react-router-dom";
import EmotionTabbar from "../components/emotion/EmotionTabbar";

const EmotionPage = () => {
  const { tab } = useParams();

  return (
    <Paper sx={paperSx}>
      <EmotionTabbar />
      <Box overflow="auto">
        {(!tab || tab === "check-in") && <CheckIn />}
        {tab === "chart" && <EmotionChart />}
      </Box>
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
