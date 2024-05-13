import { useState, useContext, useCallback, useEffect } from "react";
import {
  DragDropContext,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";

// Components
import SuccinctTimeReport from "../../home/SuccinctTimeReport";

// Utils
import { reorder } from "../../../utils";
import Droppable from "../../StrictModeDroppable";

// Context
import DbContext from "../../../context/DbContext";
import CollectionContext from "../../../CollectionContext";

const CollectionRoute = () => {
  const { t } = useTranslation();
  const {
    db: { routeList },
  } = useContext(DbContext);
  const { collections, collectionIdx, setCollectionEtas, savedEtas, setSavedEtas } =
    useContext(CollectionContext);
  
  const [newCollection, setNewCollection] = useState([
    {
      name: t('常用'),
      list: savedEtas,
      schedules: [],
    },
    ...collections
  ])
  const [items, setItems] = useState<string[]>(
    collectionIdx !== null
      ? newCollection[collectionIdx].list.filter(
          (id) => id.split("/")[0] in routeList
        )
      : []
  );

  const handleDragEnd = useCallback(
    ({ destination, source }: DropResult) => {
      // dropped outside the list
      if (!destination) return;

      const newItems = reorder(items, source.index, destination.index);

      setItems(newItems);
      if(collectionIdx === 0) {
        setSavedEtas(Array.from(newItems));
      } else {
        setCollectionEtas(Array.from(newItems));
      }
    },
    [items, collectionIdx, setSavedEtas, setCollectionEtas]
  );
  
  useEffect(() => {
    setNewCollection([
      // cannot use Array.reverse() as it is in-place reverse
      {
        name: t('常用'),
        list: savedEtas,
        schedules: [],
      },
      ...collections
    ]);
  }, [collections, savedEtas, t]);

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
