import { useState, useContext, useCallback } from "react";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  EditOutlined as EditIcon,
  Code as ReorderIcon,
} from "@mui/icons-material";
import SuccinctTimeReport from "../../home/SuccinctTimeReport";
import { reorder } from "../../../utils";
import Droppable from "../../StrictModeDroppable";
import DbContext from "../../../context/DbContext";
import CollectionContext from "../../../CollectionContext";
import { ManageMode } from "../../../data";

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
  const [mode, setMode] = useState<ManageMode>("order");

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

  const handleDelete = useCallback(
    (eta: string) => {
      const newItems = items.filter((v) => v !== eta);
      if (collectionIdx === -1) {
        setSavedEtas(newItems);
      } else {
        setCollectionEtas(newItems);
      }
      setItems(newItems);
    },
    [items, collectionIdx, setSavedEtas, setCollectionEtas]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box display="flex" justifyContent="flex-end">
        <ToggleButtonGroup
          size="small"
          value={mode}
          onChange={(_, v) => setMode(v)}
          exclusive
        >
          <ToggleButton value="order">
            <ReorderIcon sx={{ transform: "rotate(90deg)" }} fontSize="small" />
          </ToggleButton>
          <ToggleButton value="edit">
            <EditIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Droppable droppableId="saved-eta-list">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {items.length ? (
              items.map((eta, index) => (
                <DraggableListItem
                  item={eta}
                  index={index}
                  key={`savedEta-${eta}`}
                  mode={mode}
                  onDelete={() => handleDelete(eta)}
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
  mode: ManageMode;
  onDelete: () => void;
}

const DraggableListItem = ({
  item,
  index,
  mode,
  onDelete,
}: DraggableListItemProps) => (
  <Draggable draggableId={item} index={index} isDragDisabled={mode !== "order"}>
    {(provided) => (
      <Box
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <SuccinctTimeReport routeId={item} mode={mode} onDelete={onDelete} />
      </Box>
    )}
  </Draggable>
);
