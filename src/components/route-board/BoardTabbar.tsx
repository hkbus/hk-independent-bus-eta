import { useContext } from "react";
import { Box, Tabs, Tab, SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";

import { TRANSPORT_SEARCH_OPTIONS } from "../../constants";
import AppContext from "../../AppContext";
import { BoardTabType } from "../../@types/types";

interface BoardTabbarProps {
  boardTab: BoardTabType;
  onChangeTab: (v: BoardTabType, rerenderList: boolean) => void;
}

const BoardTabbar = ({ boardTab, onChangeTab }: BoardTabbarProps) => {
  const { t } = useTranslation();
  const { isRecentSearchShown } = useContext(AppContext);

  return (
    <Box>
      <Tabs
        value={boardTab}
        onChange={(_, v) => onChangeTab(v, true)}
        sx={tabbarSx}
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
