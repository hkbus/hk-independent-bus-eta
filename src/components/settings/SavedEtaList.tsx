import React, { useState, useContext, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import AppContext from "../../AppContext";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { reorder } from "../../utils";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={containerSx}
          >
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

export default SavedEtaList;

const DraggableListItem = ({ item, index }) => (
  <Draggable draggableId={item} index={index} sx={entrySx}>
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

const containerSx: SxProps<Theme> = {
  p: 1,
};

const entrySx: SxProps<Theme> = {
  px: 2,
  py: 1,
  boxShadow: "2px 2px 2px 1px rgba(0, 0, 0, 0.1)",
};
