import React from "react";
import { Box, Tabs, Tab, SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";

import { TRANSPORT_SEARCH_OPTIONS } from "../../constants";

interface BoardTabbarProps {
  boardTab: BoardTabType;
  onChangeTab: (v: BoardTabType, rerenderList: boolean) => void;
}

const BoardTabbar = ({ boardTab, onChangeTab }: BoardTabbarProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={rootSx}>
      <Tabs
        value={boardTab}
        onChange={(e, v) => onChangeTab(v, true)}
        sx={tabbarSx}
      >
        {Object.keys(TRANSPORT_SEARCH_OPTIONS).map((option) => (
          <Tab key={option} label={t(option)} value={option} disableRipple />
        ))}
      </Tabs>
    </Box>
  );
};

export default BoardTabbar;

export type BoardTabType =
  | "recent"
  | "all"
  | "bus"
  | "minibus"
  | "lightRail"
  | "mtr";

export const isBoardTab = (input: unknown): input is BoardTabType => {
  return (
    input === "recent" ||
    input === "all" ||
    input === "bus" ||
    input === "minibus" ||
    input === "lightRail" ||
    input === "mtr"
  );
};

const tabbarSx: SxProps<Theme> = {
  background: (theme) => theme.palette.background.default,
  minHeight: "36px",
  overflow: "auto",
  maxWidth: "100%",
  [`& .MuiTab-root`]: {
    py: 0,
    minWidth: "85px",
    minHeight: "32px",
    [`&.Mui-selected`]: {
      color: (theme) =>
        theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
    },
    [`&.MuiButtonBase-root`]: {
      textTransform: "none",
    },
  },
  [`& .MuiTabs-indicator`]: {
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? theme.palette.primary.main : "black",
  },
  [`& .MuiTabs-scroller`]: {
    overflow: "auto !important",
  },
};

const rootSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
};
