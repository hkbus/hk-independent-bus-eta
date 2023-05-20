import React, { useContext } from "react";
import {
  Box,
  Drawer,
  IconButton,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import AppContext from "../../AppContext";
import Collection from "./collections/Collection";
import { useTranslation } from "react-i18next";
import { Add as AddIcon, Maximize as MaximizeIcon } from "@mui/icons-material";
import CollectionDialog from "./collections/CollectionDialog";

const CollectionDrawer = () => {
  const { t } = useTranslation();
  const {
    collectionDrawerRoute,
    setCollectionDrawerRoute,
    savedEtas,
    collections,
    addNewCollection,
  } = useContext(AppContext);

  return (
    <Drawer
      anchor="bottom"
      open={collectionDrawerRoute !== null}
      onClose={() => setCollectionDrawerRoute(null)}
      PaperProps={{
        sx: drawerSx,
      }}
    >
      <Box sx={rootSx}>
        <MaximizeIcon sx={dividerSx} />
        <Box sx={savedContainerSx}>
          <Collection name={t("常用")} list={savedEtas} />
        </Box>
        <Box sx={collectionTitleSx}>
          <Typography variant="h6">{t("Collections")}</Typography>
          <IconButton onClick={addNewCollection}>
            <AddIcon />
          </IconButton>
        </Box>
        <Box sx={collectionContentSx}>
          {collections.map(({ name, list }, idx) => (
            <Collection
              key={`collection-${idx}`}
              name={name}
              list={list}
              collectionIdx={idx}
            />
          ))}
        </Box>
      </Box>
      <CollectionDialog />
    </Drawer>
  );
};

export default CollectionDrawer;

const drawerSx: SxProps<Theme> = {
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
};

const rootSx: SxProps<Theme> = {
  maxHeight: "50vh",
  minHeight: "30vh",
  display: "flex",
  flexDirection: "column",
  px: 2,
  py: 1,
};

const dividerSx: SxProps<Theme> = {
  alignSelf: "center",
};

const savedContainerSx: SxProps<Theme> = {
  display: "flex",
  mb: 1,
};

const collectionTitleSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
};

const collectionContentSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  overflow: "scroll",
};
