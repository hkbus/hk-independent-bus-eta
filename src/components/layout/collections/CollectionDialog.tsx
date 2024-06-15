import { useContext, useMemo, useState } from "react";
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
import CollectionSchedule from "./CollectionSchedule";
import CollectionRoute from "./CollectionRoute";
import CollectionContext from "../../../CollectionContext";
import { RouteCollection } from "../../../@types/types";

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

  const collection: RouteCollection = useMemo(() => {
    if (collectionIdx !== null && collectionIdx >= 0) {
      return collections[collectionIdx];
    }
    return {
      name: "常用",
      list: savedEtas,
      schedules: [],
    };
  }, [collections, collectionIdx, savedEtas]);

  const [tab, changeTab] = useState<"time" | "routes">("routes");

  // collections state hasn't updated when added new collection, need to add the following
  if (collectionIdx === null || collection === undefined) {
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
          value={collection.name}
          onChange={({ target: { value } }) => updateCollectionName(value)}
          disabled={collectionIdx === -1}
          fullWidth
        />
        <Tabs
          value={tab}
          onChange={(_, value) => changeTab(value)}
          sx={tabbarSx}
        >
          <Tab value="routes" label={t("路線")} />
          {collection.schedules.length !== 0 && (
            <Tab value="time" label={t("顯示時間")} />
          )}
        </Tabs>
        <Box sx={mainSx}>
          {tab === "routes" && <CollectionRoute />}
          {tab === "time" && collection.schedules.length !== 0 && (
            <CollectionSchedule />
          )}
        </Box>
      </DialogContent>
      {collectionIdx !== -1 && (
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
