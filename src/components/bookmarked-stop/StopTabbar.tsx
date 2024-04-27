import { useContext } from "react";
import { Tabs, Tab, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import useLanguage from "../../hooks/useTranslation";
import CollectionContext from "../../CollectionContext";
import DbContext from "../../DbContext";

interface HomeTabbarProps {
  stopTab: string | null;
  onChangeTab: (v: string, rerenderList: boolean) => void;
}

const StopTabbar = ({ stopTab, onChangeTab }: HomeTabbarProps) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const { savedStops } = useContext(CollectionContext);
  const {
    db: { stopList },
  } = useContext(DbContext);

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
      onChange={(_, v) => onChangeTab(v, true)}
      sx={tabbarSx}
      variant="scrollable"
      scrollButtons
    >
      {savedStops
        .map((stopId) => stopId.split("|"))
        .filter(([, stopId]) => stopList[stopId])
        .map(([co, stopId]) => (
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
  },
  [`& .MuiTabs-flexContainer`]: {
    justifyContent: "flex-start",
  },
};
