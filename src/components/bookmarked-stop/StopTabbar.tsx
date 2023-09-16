import React, { useContext } from "react";
import { Tabs, Tab, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";

interface HomeTabbarProps {
  stopTab: string | null;
  onChangeTab: (v: string, rerenderList: boolean) => void;
}

const StopTabbar = ({ stopTab, onChangeTab }: HomeTabbarProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    db: { stopList },
    savedStops,
  } = useContext(AppContext);

  if (savedStops.length === 0) {
    return (
      <>
        <Typography variant="h6">{t("未有收藏車站")}</Typography>
        <Typography variant="body1">{t("請按下圖指示增加")}</Typography>
      </>
    );
  }

  return (
    <Tabs
      value={stopTab}
      onChange={(e, v) => onChangeTab(v, true)}
      sx={tabbarSx}
      variant="scrollable"
      scrollButtons
    >
      {savedStops
        .map((stopId) => stopId.split("|"))
        .filter(([co, stopId]) => stopList[stopId])
        .map(([co, stopId], idx) => (
          <Tab
            key={`stops-${stopId}`}
            label={stopList[stopId].name[language]}
            value={`${co}|${stopId}`}
            disableRipple
          />
        ))}
    </Tabs>
  );
};

export default StopTabbar;

const tabbarSx: SxProps<Theme> = {
  background: (theme) => theme.palette.background.default,
  minHeight: "36px",
  [`& .MuiTab-root`]: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: "32px",
    [`&.Mui-selected`]: {
      color: (theme) =>
        theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
    },
  },
  [`& .MuiTabs-flexContainer`]: {
    justifyContent: "flex-start",
  },
  [`& .MuiTabs-indicator`]: {
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
  },
};
