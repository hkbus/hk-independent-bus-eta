import { useContext } from "react";
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
import { useTranslation } from "react-i18next";
import DbContext from "../../../context/DbContext";
import CollectionContext from "../../../CollectionContext";

interface CollectionProps {
  name: string;
  list: string[];
  collectionIdx?: number | null;
}

const Collection = ({ name, list, collectionIdx = null }: CollectionProps) => {
  const { t } = useTranslation();
  const {
    db: { routeList },
  } = useContext(DbContext);
  const { collectionDrawerRoute, toggleCollectionDialog, toggleCollectionEta } =
    useContext(CollectionContext);

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
          checked={list.includes(collectionDrawerRoute ?? "")}
          onClick={() => {
            if (collectionDrawerRoute && collectionIdx !== null) {
              if(collectionIdx > 0) {
                toggleCollectionEta(collectionDrawerRoute, collectionIdx - 1);
              } else {
                toggleCollectionEta(collectionDrawerRoute, null)
              }
            }
          }}
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
