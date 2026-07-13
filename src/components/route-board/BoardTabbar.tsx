import { useContext } from "react";
import { Box, Tabs, Tab, SxProps, Theme, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  AllInclusive as AllInclusiveIcon,
  FilterAlt as FilterAltIcon,
} from "@mui/icons-material";

import { TRANSPORT_SEARCH_OPTIONS } from "../../constants";
import AppContext from "../../context/AppContext";
import { BoardTabType } from "../../@types/types";
import { useHorizontalWheelScroll } from "../../hooks/useHorizontalWheelScroll";
import { vibrate } from "../../utils";

interface BoardTabbarProps {
  boardTab: BoardTabType;
  onChangeTab: (v: BoardTabType, rerenderList: boolean) => void;
}

const BoardTabbar = ({ boardTab, onChangeTab }: BoardTabbarProps) => {
  const { t } = useTranslation();
  const {
    toggleRouteFilter,
    vibrateDuration,
    isRouteFilter,
    isRecentSearchShown,
  } = useContext(AppContext);
  useHorizontalWheelScroll();

  return (
    <Box display="flex" alignItems="center">
      <IconButton
        onClick={() => {
          vibrate(vibrateDuration);
          toggleRouteFilter();
        }}
        aria-label={t(isRouteFilter ? "只顯示現時路線" : "顯示所有路線")}
        sx={{ mx: 1 }}
      >
        {isRouteFilter ? <FilterAltIcon /> : <AllInclusiveIcon />}
      </IconButton>
      <Tabs
        value={boardTab}
        onChange={(_, v) => onChangeTab(v, true)}
        sx={tabbarSx}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
      >
        {Object.keys(TRANSPORT_SEARCH_OPTIONS)
          .filter((option) => isRecentSearchShown || option !== "recent")
          .map((option) => (
            <Tab key={option} label={t(option)} value={option} disableRipple />
          ))}
      </Tabs>
    </Box>
  );
};

export default BoardTabbar;

export const isBoardTab = (
  input: unknown,
  isRecentSearchShown: boolean
): input is BoardTabType => {
  return (
    (isRecentSearchShown && input === "recent") ||
    input === "all" ||
    input === "bus" ||
    input === "minibus" ||
    input === "lightRail" ||
    input === "mtr" ||
    input === "ferry"
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
    [`&.MuiButtonBase-root`]: {
      textTransform: "none",
    },
  },
  [`& .MuiTabs-scroller`]: {
    overflow: "auto !important",
  },
};
