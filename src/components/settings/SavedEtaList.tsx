import React, { useState, useContext, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Box } from "@mui/material";
import AppContext from "../../AppContext";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { reorder } from "../../utils";

const SavedEtaList = () => {
  const {
    db: { routeList },
    savedEtas,
    setSavedEtas,
  } = useContext(AppContext);
  const [items, setItems] = useState(
    // cannot use Array.reverse() as it is in-place reverse
    savedEtas.filter((id) => id.split("/")[0] in routeList).reverse()
  );

  const handleDragEnd = useCallback(
    ({ destination, source }: DropResult) => {
      // dropped outside the list
      if (!destination) return;

      const newItems = reorder(items, source.index, destination.index);

      setItems(newItems);
      setSavedEtas(Array.from(newItems).reverse());
    },
    [items, setItems, setSavedEtas]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="saved-eta-list">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((eta, index) => (
              <DraggableListItem
                item={eta}
                index={index}
                key={`savedEta-${eta}`}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SavedEtaList;

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
