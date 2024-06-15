import { useState, useContext, useCallback } from "react";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import SuccinctTimeReport from "../../home/SuccinctTimeReport";
import { reorder } from "../../../utils";
import Droppable from "../../StrictModeDroppable";
import DbContext from "../../../context/DbContext";
import CollectionContext from "../../../CollectionContext";

const CollectionRoute = () => {
  const { t } = useTranslation();
  const {
    db: { routeList },
  } = useContext(DbContext);
  const {
    collections,
    collectionIdx,
    setCollectionEtas,
    savedEtas,
    setSavedEtas,
  } = useContext(CollectionContext);

  const [items, setItems] = useState<string[]>(() => {
    if (collectionIdx === null) return [];
    if (collectionIdx === -1) return savedEtas;
    return collections[collectionIdx].list.filter(
      (id) => id.split("/")[0] in routeList
    );
  });

  const handleDragEnd = useCallback(
    ({ destination, source }: DropResult) => {
      // dropped outside the list
      if (!destination) return;

      const newItems = reorder(items, source.index, destination.index);

      setItems(newItems);
      if (collectionIdx === -1) {
        setSavedEtas(Array.from(newItems));
      } else {
        setCollectionEtas(Array.from(newItems));
      }
    },
    [items, collectionIdx, setSavedEtas, setCollectionEtas]
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
                <b>{t("未有收藏路線")}</b>
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

interface DraggableListItemProps {
  item: string;
  index: number;
}

const DraggableListItem = ({ item, index }: DraggableListItemProps) => (
  <Draggable draggableId={item} index={index}>
    {(provided) => (
      <Box
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <SuccinctTimeReport routeId={item} mode="order" />
      </Box>
    )}
  </Draggable>
);
