import { memo, useCallback, useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListSubheader,
  Typography,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  DeleteOutline as DeleteIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import Droppable from "../StrictModeDroppable";
import ItemLabel from "./ItemLabel";

export interface MoveTarget {
  index: number;
  name: string;
}

interface Props {
  droppableId: string;
  /** droppables of different types do not accept each other's items */
  type?: string;
  isDropDisabled?: boolean;
  items: string[];
  emptyText: string;
  onMove: (from: number, to: number) => void;
  onRemove: (item: string) => void;
  /** other collections this item may be moved to (omit to hide the option) */
  moveTargets?: MoveTarget[];
  onMoveTo?: (item: string, target: number) => void;
}

interface RowProps {
  dragId: string;
  item: string;
  index: number;
  onRemove: (item: string) => void;
  onMenu: (el: HTMLElement, index: number) => void;
  removeLabel: string;
  moreLabel: string;
  dragLabel: string;
}

const rowSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  px: 0.5,
  minHeight: 56,
  borderTop: 1,
  borderColor: "divider",
  bgcolor: "background.paper",
};
const rowDraggingSx = { ...rowSx, bgcolor: "action.hover" };
const handleSx = {
  display: "flex",
  p: 1,
  color: "text.secondary",
  touchAction: "none",
};

// memo: with hundreds of rows, re-rendering all of them per drag move made drops take >1s
const Row = memo(function Row({
  dragId,
  item,
  index,
  onRemove,
  onMenu,
  removeLabel,
  moreLabel,
  dragLabel,
}: RowProps) {
  return (
    <Draggable draggableId={dragId} index={index}>
      {(drag, snapshot) => (
        <Box
          ref={drag.innerRef}
          {...drag.draggableProps}
          sx={snapshot.isDragging ? rowDraggingSx : rowSx}
        >
          <Box {...drag.dragHandleProps} aria-label={dragLabel} sx={handleSx}>
            <DragIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ItemLabel item={item} />
          </Box>
          <IconButton aria-label={removeLabel} onClick={() => onRemove(item)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={moreLabel}
            aria-haspopup="menu"
            onClick={(e) => onMenu(e.currentTarget, index)}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Draggable>
  );
});

const ItemList = ({
  droppableId,
  type,
  isDropDisabled,
  items,
  emptyText,
  onMove,
  onRemove,
  moveTargets,
  onMoveTo,
}: Props) => {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{ el: HTMLElement; index: number } | null>(
    null
  );

  // stable callbacks so memoised rows don't re-render on every pointer move while dragging
  const latest = useRef({ onRemove });
  latest.current = { onRemove };
  const remove = useCallback(
    (item: string) => latest.current.onRemove(item),
    []
  );
  const openMenu = useCallback(
    (el: HTMLElement, index: number) => setMenu({ el, index }),
    []
  );
  const close = () => setMenu(null);
  const current = menu ? items[menu.index] : undefined;

  return (
    <>
      {/* the DragDropContext lives in the page so items can move between lists */}
      <Droppable
        droppableId={droppableId}
        type={type}
        isDropDisabled={isDropDisabled}
      >
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ minHeight: 56 }}
          >
            {!items.length && (
              <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                {emptyText}
              </Typography>
            )}
            {items.map((item, index) => (
              <Row
                key={`${droppableId}:${item}#${items.indexOf(item) === index ? 0 : index}`}
                // list prefix: the same route may sit in two groups; occurrence suffix covers legacy duplicates
                dragId={`${droppableId}:${item}#${items.indexOf(item) === index ? 0 : index}`}
                item={item}
                index={index}
                onRemove={remove}
                onMenu={openMenu}
                removeLabel={t("移除")}
                moreLabel={t("更多操作")}
                dragLabel={t("拖曳排序")}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
      <Menu anchorEl={menu?.el} open={!!menu} onClose={close}>
        <MenuItem
          disabled={!menu || menu.index === 0}
          onClick={() => {
            if (menu) onMove(menu.index, menu.index - 1);
            close();
          }}
        >
          {t("上移")}
        </MenuItem>
        <MenuItem
          disabled={!menu || menu.index === items.length - 1}
          onClick={() => {
            if (menu) onMove(menu.index, menu.index + 1);
            close();
          }}
        >
          {t("下移")}
        </MenuItem>
        {moveTargets &&
          moveTargets.length > 0 &&
          onMoveTo &&
          current && [
            <Divider key="d" />,
            <ListSubheader key="h">{t("移至")}</ListSubheader>,
            ...moveTargets.map((target) => (
              <MenuItem
                key={target.index}
                onClick={() => {
                  onMoveTo(current, target.index);
                  close();
                }}
              >
                {target.name}
              </MenuItem>
            )),
          ]}
      </Menu>
    </>
  );
};

export default ItemList;
