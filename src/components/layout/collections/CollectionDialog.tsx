import { useContext, useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { DeleteForever as DeleteForeverIcon } from "@mui/icons-material";

// Components
import CollectionSchedule from "./CollectionSchedule";
import CollectionRoute from "./CollectionRoute";

// Context
import CollectionContext from "../../../CollectionContext";

const CollectionDialog = () => {
  const { t } = useTranslation();
  const {
    collections,
    collectionIdx,
    toggleCollectionDialog,
    updateCollectionName,
    removeCollection,
    savedEtas,
  } = useContext(CollectionContext);

  // GitHub Pull: 181
  const [newCollection, setNewCollection] = useState([
    {
      name: t("常用"),
      list: savedEtas,
      schedules: [],
    },
    ...collections,
  ]);

  const [tab, changeTab] = useState<"time" | "routes">("routes");

  useEffect(() => {
    setNewCollection([
      // cannot use Array.reverse() as it is in-place reverse
      {
        name: t("常用"),
        list: savedEtas,
        schedules: [],
      },
      ...collections,
    ]);
  }, [collections, savedEtas, t]);

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
        {newCollection[collectionIdx].name !== t("常用") ? (
          <TextField
            id="collection-input"
            variant="standard"
            value={newCollection[collectionIdx].name}
            onChange={({ target: { value } }) => updateCollectionName(value)}
            fullWidth
          />
        ) : (
          t("常用")
        )}
        <Tabs
          value={tab}
          onChange={(_, value) => changeTab(value)}
          sx={tabbarSx}
        >
          <Tab value="routes" label={t("路線")} />
          {newCollection[collectionIdx].schedules.length !== 0 && (
            <Tab value="time" label={t("顯示時間")} />
          )}
        </Tabs>
        <Box sx={mainSx}>
          {tab === "routes" && <CollectionRoute />}
          {tab === "time" &&
            newCollection[collectionIdx].schedules.length !== 0 && (
              <CollectionSchedule />
            )}
        </Box>
      </DialogContent>
      {newCollection[collectionIdx].name !== t("常用") && (
        <DialogActions sx={actionSx}>
          <IconButton
            onClick={() => removeCollection(collectionIdx)}
            sx={deleteSx}
          >
            <DeleteForeverIcon />
          </IconButton>
        </DialogActions>
      )}
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
  },
  [`& .MuiTabs-flexContainer`]: {
    justifyContent: "center",
  },
};
