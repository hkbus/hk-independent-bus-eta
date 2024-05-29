import { useState, useContext, useCallback, useEffect } from "react";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
import {
  DragHandle as DragHandleIcon,
  EditOutlined as EditOutlinedIcon,
} from "@mui/icons-material";
import { Box, IconButton, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

// Utils
import { reorder } from "../../utils";
import Droppable from "../StrictModeDroppable";

// Data
import { ManageMode } from "../../data";

// Context
import CollectionContext from "../../CollectionContext";

// Types
import { RouteCollection } from "../../@types/types";

// mode: delete is for edit here
const CollectionOrderList = ({ mode }: { mode: ManageMode }) => {
  const { t } = useTranslation();
  const { collections, setCollections, toggleCollectionDialog, savedEtas } =
    useContext(CollectionContext);
  const [items, setItems] = useState([
    // cannot use Array.reverse() as it is in-place reverse
    {
      name: t("常用"),
      list: savedEtas,
      schedules: [],
    },
    ...collections,
  ]);

  const handleDragEnd = useCallback(
    ({ destination, source }: DropResult) => {
      // dropped outside the list
      if (!destination) return;

      const newItems = reorder(items, source.index, destination.index);
      // Remove the savedEtas (first object in the items array)
      newItems.shift();
      setCollections(newItems);
    },
    [items, setCollections]
  );

  const handleDelete = useCallback(
    (idx: number) => {
      toggleCollectionDialog(idx);
    },
    [toggleCollectionDialog]
  );

  useEffect(() => {
    setItems([
      // cannot use Array.reverse() as it is in-place reverse
      {
        name: t("常用"),
        list: savedEtas,
        schedules: [],
      },
      ...collections,
    ]);
  }, [collections, savedEtas, t]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="saved-eta-list">
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={containerSx}
          >
            {/* <SavedEtasItem
              item={item}
              mode={mode}
              onDelete={() => handleDelete(index)}
            /> */}
            {items.length ? (
              items.map((item, index) => (
                <DraggableListItem
                  item={item}
                  index={index}
                  key={`collection-${item.name}`}
                  mode={mode}
                  onDelete={() => handleDelete(index)}
                />
              ))
            ) : (
              <Typography sx={{ textAlign: "center", marginTop: 5 }}>
                <b>{t("未有收藏。")}</b>
              </Typography>
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default CollectionOrderList;

interface DraggableListItemProps {
  item: RouteCollection;
  index: number;
  mode: ManageMode;
  onDelete: () => void;
}

const DraggableListItem = ({
  item: { name, list },
  index,
  mode,
  onDelete,
}: DraggableListItemProps) => {
  const { t } = useTranslation();
  return (
    <Draggable
      draggableId={name}
      index={index}
      isDragDisabled={mode !== "order" || name === "常用"}
    >
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={entrySx}
        >
          <Box>
            <Typography variant="body1">{name}</Typography>
            <Typography variant="caption">
              {t("Number of ETAs: ")}
              {list.length}
            </Typography>
          </Box>
          {mode === "order" && name !== "常用" && <DragHandleIcon />}
          {mode === "delete" && (
            <IconButton onClick={onDelete}>
              <EditOutlinedIcon />
            </IconButton>
          )}
        </Box>
      )}
    </Draggable>
  );
};

const containerSx: SxProps<Theme> = {
  p: 1,
  overflowY: "scroll",
};

const entrySx: SxProps<Theme> = {
  px: 2,
  py: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "2px 2px 2px 1px rgba(0, 0, 0, 0.1)",
};
