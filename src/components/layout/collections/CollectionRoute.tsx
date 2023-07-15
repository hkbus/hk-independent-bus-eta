import React, { useState, useContext, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Box, Typography } from "@mui/material";
import AppContext from "../../../AppContext";
import SuccinctTimeReport from "../../home/SuccinctTimeReport";
import { reorder } from "../../../utils";
import { useTranslation } from "react-i18next";

const CollectionRoute = () => {
  const {
    db: { routeList },
    collections,
    collectionIdx,
    setCollectionEtas,
  } = useContext(AppContext);
  const [items, setItems] = useState(
    collections[collectionIdx].list.filter(
      (id) => id.split("/")[0] in routeList
    )
  );
  const { t } = useTranslation();

  const handleDragEnd = useCallback(
    ({ destination, source }: DropResult) => {
      // dropped outside the list
      if (!destination) return;

      const newItems = reorder(items, source.index, destination.index);

      setItems(newItems);
      setCollectionEtas(Array.from(newItems));
    },
    [items, setItems, setCollectionEtas]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="saved-eta-list">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {items.length ? (
              items.map((eta, index) => (
                <DraggableListItem
                  item={eta}
                  index={index}
                  key={`savedEta-${eta}`}
                />
              ))
            ) : (
              <Typography sx={{ textAlign: "center", marginTop: 5 }}>
                <b>{t("未有收藏嘅路線。")}</b>
              </Typography>
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default CollectionRoute;

const DraggableListItem = ({ item, index }) => (
  <Draggable draggableId={item} index={index}>
    {(provided) => (
      <Box
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <SuccinctTimeReport routeId={item} disabled />
      </Box>
    )}
  </Draggable>
);
