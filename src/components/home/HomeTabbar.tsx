import React from "react";
import { Tabs, Tab, SxProps, Theme } from "@mui/material";
import {
  Cloud as CloudIcon,
  Star as StarIcon,
  CompassCalibration as CompassCalibrationIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface HomeTabbarProps {
  homeTab: HomeTabType;
  onChangeTab: (v: HomeTabType, rerenderList: boolean) => void;
}

const HomeTabbar = ({ homeTab, onChangeTab }: HomeTabbarProps) => {
  const { t } = useTranslation();

  return (
    <Tabs
      value={homeTab}
      onChange={(e, v) => onChangeTab(v, true)}
      sx={tabbarSx}
    >
      <Tab
        iconPosition="start"
        icon={<CloudIcon />}
        label={t("綜合")}
        value="both"
        disableRipple
      />
      <Tab
        iconPosition="start"
        icon={<StarIcon />}
        label={t("常用")}
        value="saved"
        disableRipple
      />
      <Tab
        iconPosition="start"
        icon={<CompassCalibrationIcon />}
        label={t("附近")}
        value="nearby"
        disableRipple
      />
      <Tab
        iconPosition="start"
        icon={<BookmarkIcon />}
        label={t("Collections")}
        value="collections"
        disableRipple
      />
    </Tabs>
  );
};

export default HomeTabbar;

export type HomeTabType = "both" | "saved" | "nearby" | "collections";

export const isHomeTab = (input: unknown): input is HomeTabType => {
  return (
    input === "both" ||
    input === "saved" ||
    input === "nearby" ||
    input === "collections"
  );
};

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
    justifyContent: "center",
  },
  [`& .MuiTabs-indicator`]: {
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
  },
};
