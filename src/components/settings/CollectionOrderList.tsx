import React, { useState, useContext, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { DragHandle as DragHandleIcon } from "@mui/icons-material";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import AppContext from "../../AppContext";
import { reorder } from "../../utils";
import { useTranslation } from "react-i18next";

const CollectionOrderList = () => {
  const { collections, setCollections } = useContext(AppContext);
  const [items, setItems] = useState(
    // cannot use Array.reverse() as it is in-place reverse
    collections
  );
  const { t } = useTranslation();

  const handleDragEnd = useCallback(
    ({ destination, source }: DropResult) => {
      // dropped outside the list
      if (!destination) return;

      const newItems = reorder(items, source.index, destination.index);

      setItems(newItems);
      setCollections(newItems);
    },
    [items, setItems, setCollections]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="saved-eta-list">
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={containerSx}
          >
            {items.length ? (
              items.map((item, index) => (
                <DraggableListItem
                  item={item}
                  index={index}
                  key={`collection-${item.name}`}
                  t={t}
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

const DraggableListItem = ({ item: { name, list }, index, t }) => (
  <Draggable draggableId={name} index={index}>
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
        <DragHandleIcon />
      </Box>
    )}
  </Draggable>
);

const containerSx: SxProps<Theme> = {
  p: 1,
};

const entrySx: SxProps<Theme> = {
  px: 2,
  py: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "2px 2px 2px 1px rgba(0, 0, 0, 0.1)",
};
