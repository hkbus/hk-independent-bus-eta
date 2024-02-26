import { Box, SxProps, Theme, Typography } from "@mui/material";

const EmotionChart = () => {
  return (
    <Box sx={rootSx}>
      <Typography variant="h6">Coming Soon...</Typography>
    </Box>
  );
};

export default EmotionChart;

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  gap: 4,
  pt: 2,
};
