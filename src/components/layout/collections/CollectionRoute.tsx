import { useState, useContext, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Box, Typography } from "@mui/material";
import SuccinctTimeReport from "../../home/SuccinctTimeReport";
import { reorder } from "../../../utils";
import { useTranslation } from "react-i18next";
import DbContext from "../../../context/DbContext";
import CollectionContext from "../../../CollectionContext";

const CollectionRoute = () => {
  const {
    db: { routeList },
  } = useContext(DbContext);
  const { collections, collectionIdx, setCollectionEtas } =
    useContext(CollectionContext);
  const [items, setItems] = useState<string[]>(
    collectionIdx !== null
      ? collections[collectionIdx].list.filter(
          (id) => id.split("/")[0] in routeList
        )
      : []
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
