import { Box, Paper, SxProps, Theme, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

const NoticeCard = () => {
  return (
    <Paper
      variant="outlined"
      sx={rootSx}
      onClick={() => window.open("https://t.me/hkbusapp", "_target")}
    >
      <ErrorIcon color="error" />
      <Box>
        <Typography>因資料一線通提供的 API 出現異常</Typography>
        <Typography>hkbus.app 暫未能提供九巴到站預報</Typography>
        <Typography>我們已向 1823 求助</Typography>
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
  gap: 1,
  display: "flex",
};
