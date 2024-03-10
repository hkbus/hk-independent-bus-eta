import { useState, useContext, useCallback } from "react";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
import Droppable from "../StrictModeDroppable";
import { Box, IconButton, SxProps, Theme, Typography } from "@mui/material";
import AppContext from "../../AppContext";
import { reorder } from "../../utils";
import { useTranslation } from "react-i18next";
import {
  DeleteOutline as DeleteIcon,
  DragHandle as DragHandleIcon,
} from "@mui/icons-material";
import { ManageMode } from "../../data";
import useLanguage from "../../hooks/useTranslation";

const StopOrderList = ({ mode }: { mode: ManageMode }) => {
  const {
    db: { stopList },
    savedStops,
    setSavedStops,
    updateSavedStops,
  } = useContext(AppContext);
  const [items, setItems] = useState(
    savedStops.filter((id) => id.split("|")[1] in stopList)
  );
  const { t } = useTranslation();

  const handleDragEnd = useCallback(
    ({ destination, source }: DropResult) => {
      // dropped outside the list
      if (!destination) return;

      const newItems = reorder(items, source.index, destination.index);

      setItems(newItems);
      setSavedStops(Array.from(newItems));
    },
    [items, setItems, setSavedStops]
  );

  const handleDelete = useCallback((stop: string) => 
    () => {
      updateSavedStops(stop);
      setItems((prev) => prev.filter((v) => v !== stop));
    },
    [updateSavedStops]
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
                  mode={mode}
                  onDelete={handleDelete(stop)}
                />
              ))
            ) : (
              <Typography sx={{ textAlign: "center", marginTop: 5 }}>
                <b>{t("未有收藏車站")}</b>
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

interface DraggableListItemProps {
  item: string;
  index: number;
  mode: ManageMode;
  onDelete: () => void;
}

const DraggableListItem = ({ item, index, mode, onDelete }: DraggableListItemProps) => {
  const {
    db: { stopList },
  } = useContext(AppContext);
  const [, stopId] = item.split("|");
  const language = useLanguage();

  return (
    <Draggable
      draggableId={item}
      index={index}
      isDragDisabled={mode !== "order"}
    >
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
          {mode === "order" && <DragHandleIcon />}
          {mode === "delete" && (
            <IconButton onClick={onDelete}>
              <DeleteIcon />
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
  py: 2,
  boxShadow: "2px 2px 2px 1px rgba(0, 0, 0, 0.1)",
  display: "flex",
  justifyContent: "space-between",
};
