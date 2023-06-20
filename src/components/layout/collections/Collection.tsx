import React, { useContext } from "react";
import {
  Avatar,
  Box,
  Checkbox,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material";
import AppContext from "../../../AppContext";
import { useTranslation } from "react-i18next";

interface CollectionProps {
  name: string;
  list: string[];
  collectionIdx?: number;
}

const Collection = ({ name, list, collectionIdx = null }: CollectionProps) => {
  const { t } = useTranslation();
  const {
    collectionDrawerRoute,
    db: { routeList },
    toggleCollectionDialog,
    toggleCollectionEta,
  } = useContext(AppContext);

  return (
    <Box sx={collectionSx}>
      <Box
        sx={{
          ...leftContainerSx,
          cursor: collectionIdx !== null ? "pointer" : "auto",
        }}
        onClick={() => toggleCollectionDialog(collectionIdx)}
      >
        <Avatar>{name.charAt(0)}</Avatar>
        <Box sx={nameContainerSx}>
          <Typography variant="body1">{name}</Typography>
          <Typography variant="caption">
            {t("Number of ETAs: ")}
            {
              list.filter((r) => routeList[r.split("/")[0]] !== undefined)
                .length
            }
          </Typography>
        </Box>
      </Box>
      <Box sx={buttonContainerSx}>
        <Checkbox
          icon={<BookmarkBorderIcon />}
          checkedIcon={<BookmarkIcon />}
          checked={list.includes(collectionDrawerRoute)}
          onClick={() =>
            toggleCollectionEta(collectionDrawerRoute, collectionIdx)
          }
        />
      </Box>
    </Box>
  );
};

export default Collection;

const collectionSx: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  justifyContent: "space-between",
};

const leftContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  flex: 1,
  "& .MuiAvatar-colorDefault": {
    color: (theme) =>
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
  },
};

const nameContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};

const buttonContainerSx: SxProps<Theme> = {
  display: "flex",
};
