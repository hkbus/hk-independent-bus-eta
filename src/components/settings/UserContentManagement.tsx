import { useState } from "react";
import {
  Box,
  Tab,
  Tabs,
  SxProps,
  Theme,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Code as CodeIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditOutlinedIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

// Components
import CollectionOrderList from "./CollectionOrderList";
import StopOrderList from "./StopOrderList";
// import SavedEtaList from "./SavedEtaList";

// Data
import { ManageMode } from "../../data";

type TAB = "savedOrder" | "collectionOrder" | "stopOrder";

const UserContentManagement = () => {
  const [tab, setTab] = useState<TAB>("collectionOrder");
  const [mode, setMode] = useState<ManageMode>("order");
  const { t } = useTranslation();

  return (
    <Box sx={rootSx}>
      <Box sx={headerSx}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={tabbarSx}
          variant="scrollable"
          scrollButtons
        >
          {/* <Tab value="savedOrder" label={t("常用路線")} /> */}
          <Tab value="collectionOrder" label={t("路線收藏")} />
          <Tab value="stopOrder" label={t("車站")} />
        </Tabs>
        <ToggleButtonGroup
          value={mode}
          onChange={(_, v) => v && setMode(v)}
          sx={{ alignSelf: "flex-end" }}
          size="small"
          exclusive
        >
          <ToggleButton value="order">
            <CodeIcon sx={{ transform: "rotate(90deg)" }} fontSize="small" />
          </ToggleButton>
          <ToggleButton value="delete">
            {tab !== "collectionOrder" && <DeleteIcon fontSize="small" />}
            {tab === "collectionOrder" && <EditOutlinedIcon fontSize="small" />}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {/* {tab === "savedOrder" && <SavedEtaList mode={mode} />} */}
      {tab === "collectionOrder" && <CollectionOrderList mode={mode} />}
      {tab === "stopOrder" && <StopOrderList mode={mode} />}
    </Box>
  );
};

export default UserContentManagement;

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  px: 1,
  overflow: "hidden",
};

const headerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  py: 1,
};

const tabbarSx: SxProps<Theme> = {
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
