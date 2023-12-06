import React, { useContext } from "react";
import { Tabs, Tab, SxProps, Theme } from "@mui/material";
import {
  Star as StarIcon,
  CompassCalibration as CompassCalibrationIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import { RouteCollection } from "../../typing";

interface HomeTabbarProps {
  homeTab: HomeTabType;
  onChangeTab: (v: HomeTabType, rerenderList: boolean) => void;
}

const HomeTabbar = ({ homeTab, onChangeTab }: HomeTabbarProps) => {
  const { t } = useTranslation();
  const { collections } = useContext(AppContext);

  return (
    <Tabs
      value={homeTab}
      onChange={(e, v) => onChangeTab(v, true)}
      sx={tabbarSx}
      variant="scrollable"
      scrollButtons
    >
      <Tab
        iconPosition="start"
        icon={<CompassCalibrationIcon />}
        label={t("附近")}
        value="nearby"
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
        icon={<BookmarkIcon />}
        label={t("Collections")}
        value="collections"
        disableRipple
      />
      {collections.map((collection, idx) => (
        <Tab
          key={`collection-${idx}`}
          label={collection.name}
          value={collection.name}
          disableRipple
        />
      ))}
    </Tabs>
  );
};

export default HomeTabbar;

export type HomeTabType = "saved" | "nearby" | "collections";

export const isHomeTab = (
  input: unknown,
  collections: RouteCollection[]
): input is HomeTabType => {
  if (input === "saved" || input === "nearby" || input === "collections") {
    return true;
  }
  for (let i = 0; i < collections.length; ++i) {
    if (input === collections[i].name) {
      return true;
    }
  }
  return false;
};

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
