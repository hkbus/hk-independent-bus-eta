import React, { useState, useContext, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import AppContext from "../../AppContext";
import { reorder } from "../../utils";
import { useTranslation } from "react-i18next";
import { DragHandle as DragHandleIcon } from "@mui/icons-material";

const StopOrderList = () => {
  const {
    db: { stopList },
    savedStops,
    setSavedStops,
  } = useContext(AppContext);
  const [items, setItems] = useState(
    // cannot use Array.reverse() as it is in-place reverse
    savedStops.filter((id) => id.split("|")[1] in stopList).reverse()
  );
  const { t } = useTranslation();

  const handleDragEnd = useCallback(
    ({ destination, source }: DropResult) => {
      // dropped outside the list
      if (!destination) return;

      const newItems = reorder(items, source.index, destination.index);

      setItems(newItems);
      setSavedStops(Array.from(newItems).reverse());
    },
    [items, setItems, setSavedStops]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="saved-stop-list">
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={containerSx}
          >
            {items.length ? (
              items.map((stop, index) => (
                <DraggableListItem
                  item={stop}
                  index={index}
                  key={`savedStop-${stop}`}
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

export default StopOrderList;

const DraggableListItem = ({ item, index }) => {
  const {
    db: { stopList },
  } = useContext(AppContext);
  const [, stopId] = item.split("|");
  const {
    i18n: { language },
  } = useTranslation();

  return (
    <Draggable draggableId={item} index={index}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={entrySx}
        >
          <Box>
            <Typography variant="body1">
              {stopList[stopId]?.name[language]}
            </Typography>
          </Box>
          <DragHandleIcon />
        </Box>
      )}
    </Draggable>
  );
};

const containerSx: SxProps<Theme> = {
  p: 1,
};

const entrySx: SxProps<Theme> = {
  px: 2,
  py: 2,
  boxShadow: "2px 2px 2px 1px rgba(0, 0, 0, 0.1)",
  display: "flex",
  justifyContent: "space-between",
};
