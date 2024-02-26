import { SxProps, Tab, Tabs, Theme } from "@mui/material";

interface EmotionTabbarProps {
  value: EmotionTabType;
  onChange: (tab: EmotionTabType) => void;
}

const EmotionTabbar = ({ value, onChange }: EmotionTabbarProps) => {
  return (
    <Tabs value={value} onChange={(_, v) => onChange(v)} sx={tabbarSx} centered>
      <Tab label="Check in" value="check in" />
      <Tab label="Chart" value="chart" />
    </Tabs>
  );
};

export default EmotionTabbar;

export type EmotionTabType = "check in" | "chart";

const tabbarSx: SxProps<Theme> = {
  background: (theme) => theme.palette.background.default,
  minHeight: "36px",
  [`& .MuiTab-root`]: {
    textTransform: "none",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: "32px",
  },
  [`& .MuiTabs-flexContainer`]: {
    justifyContent: "flex-start",
  },
};
