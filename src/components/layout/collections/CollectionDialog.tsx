import React, { useContext, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  SxProps,
  Tab,
  Tabs,
  TextField,
  Theme,
} from "@mui/material";
import AppContext from "../../../AppContext";
import { useTranslation } from "react-i18next";
import { DeleteForever as DeleteForeverIcon } from "@mui/icons-material";
import CollectionSchedule from "./CollectionSchedule";
import CollectionRoute from "./CollectionRoute";

const CollectionDialog = () => {
  const {
    collections,
    collectionIdx,
    toggleCollectionDialog,
    updateCollectionName,
    removeCollection,
  } = useContext(AppContext);
  const { t } = useTranslation();

  const [tab, changeTab] = useState<"time" | "routes">("routes");

  if (collectionIdx === null) {
    return null;
  }

  return (
    <Dialog
      open={collectionIdx !== null}
      onClose={() => {
        toggleCollectionDialog(null);
      }}
      fullWidth
    >
      <DialogContent sx={contentContainerSx}>
        <TextField
          id="collection-input"
          variant="standard"
          value={collections[collectionIdx].name}
          onChange={({ target: { value } }) => updateCollectionName(value)}
          fullWidth
        />
        <Tabs
          value={tab}
          onChange={(e, value) => changeTab(value)}
          sx={tabbarSx}
        >
          <Tab value="routes" label={t("路線")} />
          <Tab value="time" label={t("顯示時間")} />
        </Tabs>
        <Box sx={mainSx}>
          {tab === "routes" && <CollectionRoute />}
          {tab === "time" && <CollectionSchedule />}
        </Box>
      </DialogContent>
      <DialogActions sx={actionSx}>
        <IconButton
          onClick={() => removeCollection(collectionIdx)}
          sx={deleteSx}
        >
          <DeleteForeverIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};

export default CollectionDialog;

const contentContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

const mainSx: SxProps<Theme> = {
  height: "50vh",
  pr: 1,
  overflow: "scroll",
  "&::-webkit-scrollbar": {
    display: "none",
  },
};

const actionSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-start",
};

const deleteSx: SxProps<Theme> = {
  opacity: 0.3,
  "&:hover": {
    opacity: 1,
  },
};

const tabbarSx: SxProps<Theme> = {
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
