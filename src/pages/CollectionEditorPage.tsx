import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import { DragDropContext, DragStart, DropResult } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import CollectionContext from "../CollectionContext";
import { RouteCollection } from "../@types/types";
import { DEFAULT_ROUTE_COLLECTION } from "../constants";
import {
  addItem,
  duplicateCollection,
  moveBetween,
  moveBetweenAt,
  moveWithin,
  removeItem,
} from "../utils/collectionOps";
import ItemList from "../components/collection-editor/ItemList";
import AddSearchDialog from "../components/collection-editor/AddSearchDialog";

const STOPS = -1; // pseudo target for the saved-stops list
const FAV_NAME = "常用";

interface Snapshot {
  savedEtas: string[];
  savedStops: string[];
  collections: RouteCollection[];
}

/** Index 0 = favourites (savedEtas), 1.. = user collections. */
const CollectionEditorPage = () => {
  const { t } = useTranslation();
  const {
    collections,
    savedEtas,
    savedStops,
    setCollections,
    setSavedEtas,
    setSavedStops,
    toggleCollectionDialog,
  } = useContext(CollectionContext);

  const [open, setOpen] = useState<Record<string, boolean>>({
    [FAV_NAME]: true,
  });
  const [renaming, setRenaming] = useState<number | null>(null); // index in `all`
  const [renameError, setRenameError] = useState("");
  const [menu, setMenu] = useState<{ el: HTMLElement; index: number } | null>(
    null
  );
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [adding, setAdding] = useState<number | null>(null); // index in `all`, or STOPS
  const [undo, setUndo] = useState<{ message: string; snap: Snapshot } | null>(
    null
  );
  const [saveFailed, setSaveFailed] = useState(false);
  // item being dragged + its source list; other groups already holding it refuse the drop
  const [dragging, setDragging] = useState<{
    item: string;
    from: string;
  } | null>(null);
  const pendingRename = useRef<number | null>(null);
  const latest = useRef<Snapshot>({ savedEtas, savedStops, collections });
  latest.current = { savedEtas, savedStops, collections };

  useEffect(() => {
    const h = () => setSaveFailed(true);
    window.addEventListener("collection-save-failed", h);
    return () => window.removeEventListener("collection-save-failed", h);
  }, []);

  const all: RouteCollection[] = [
    { name: FAV_NAME, list: savedEtas, schedules: [] },
    ...collections,
  ];

  /** Apply a new `all`/stops state, remembering the previous state for Undo. */
  const commit = useCallback(
    (
      next: RouteCollection[],
      message: string | null,
      nextStops: string[] = latest.current.savedStops
    ) => {
      const prev = latest.current;
      if (message) {
        setUndo({
          message,
          snap: {
            savedEtas: prev.savedEtas,
            savedStops: prev.savedStops,
            collections: prev.collections,
          },
        });
      }
      setSavedEtas(next[0].list);
      setCollections(next.slice(1));
      if (nextStops !== prev.savedStops) setSavedStops(nextStops);
    },
    [setSavedEtas, setCollections, setSavedStops]
  );

  const doUndo = () => {
    if (!undo) return;
    setSavedEtas(undo.snap.savedEtas);
    setCollections(undo.snap.collections);
    setSavedStops(undo.snap.savedStops);
    setUndo(null);
  };

  const uniqueName = (base: string) => {
    const names = new Set(all.map((c) => c.name));
    let name = base;
    for (let n = 2; names.has(name); n++) name = `${base} ${n}`;
    return name;
  };

  const createCollection = () => {
    const name = uniqueName(t(DEFAULT_ROUTE_COLLECTION.name));
    const next = [
      ...all,
      structuredClone({ ...DEFAULT_ROUTE_COLLECTION, name }),
    ];
    commit(next, null);
    setOpen((o) => ({ ...o, [name]: true }));
    setRenaming(next.length - 1);
    setRenameError("");
  };

  const finishRename = (index: number, value: string) => {
    const name = value.trim();
    if (name === all[index].name) {
      setRenaming(null);
      return;
    }
    if (!name) {
      setRenameError(t("名稱不能為空"));
      return;
    }
    if (all.some((c, i) => i !== index && c.name === name)) {
      setRenameError(t("名稱已存在"));
      return;
    }
    const next = all.map((c, i) => (i === index ? { ...c, name } : c));
    commit(next, null);
    setOpen((o) => ({ ...o, [name]: o[all[index].name] ?? true }));
    setRenaming(null);
    setRenameError("");
  };

  const swapCollections = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 1 || to >= all.length) return;
    const next = [...all];
    [next[index], next[to]] = [next[to], next[index]];
    commit(next, null);
  };

  const target = adding !== null && adding !== STOPS ? all[adding] : null;
  const displayName = (i: number) => (i === 0 ? t(FAV_NAME) : all[i].name);
  const moveTargetsFor = (index: number) =>
    all
      .map((_, i) => ({ index: i, name: displayName(i) }))
      .filter((x) => x.index !== index);

  const handleDragStart = ({ draggableId, source }: DragStart) => {
    const list =
      source.droppableId === "stops"
        ? latest.current.savedStops
        : [
            latest.current.savedEtas,
            ...latest.current.collections.map((c) => c.list),
          ][Number(source.droppableId.slice(2))];
    setDragging({
      item: list?.[source.index] ?? draggableId,
      from: source.droppableId,
    });
  };

  const handleDragEnd = ({ source, destination }: DropResult) => {
    setDragging(null);
    if (!destination) return;
    const { droppableId: from, index: fromIndex } = source;
    const { droppableId: to, index: toIndex } = destination;
    if (from === to) {
      if (fromIndex === toIndex) return;
      if (from === "stops") {
        commit(all, null, moveWithin(savedStops, fromIndex, toIndex));
      } else {
        const gi = Number(from.slice(2));
        commit(
          all.map((x, i) =>
            i === gi
              ? { ...x, list: moveWithin(x.list, fromIndex, toIndex) }
              : x
          ),
          null
        );
      }
      return;
    }
    if (from === "stops" || to === "stops") return; // routes and stops don't mix
    const fi = Number(from.slice(2));
    const ti = Number(to.slice(2));
    const item = all[fi]?.list[fromIndex];
    if (item === undefined) return;
    commit(
      moveBetweenAt(all, item, fi, ti, toIndex),
      t("已移動路線至 {{name}}", { name: displayName(ti) })
    );
  };

  const renderGroup = (c: RouteCollection, index: number) => {
    const isFav = index === 0;
    const expanded = !!open[c.name];
    return (
      <Paper
        key={c.name}
        variant="outlined"
        sx={{ mb: 1.5, overflow: "hidden" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            p: 0.5,
            pl: 1,
          }}
        >
          <IconButton
            aria-label={expanded ? t("收合") : t("展開")}
            aria-expanded={expanded}
            onClick={() => setOpen((o) => ({ ...o, [c.name]: !expanded }))}
          >
            <ExpandIcon
              sx={{
                transform: expanded ? "rotate(180deg)" : undefined,
                transition: "transform .2s",
              }}
            />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {renaming === index ? (
              <TextField
                autoFocus
                fullWidth
                size="small"
                defaultValue={c.name}
                error={!!renameError}
                helperText={renameError || undefined}
                inputProps={{ "aria-label": t("收藏名稱"), maxLength: 40 }}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => finishRename(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    finishRename(index, (e.target as HTMLInputElement).value);
                  if (e.key === "Escape") {
                    setRenaming(null);
                    setRenameError("");
                  }
                }}
              />
            ) : (
              <Box
                onClick={() => setOpen((o) => ({ ...o, [c.name]: !expanded }))}
                sx={{ cursor: "pointer" }}
              >
                <Typography noWrap variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {isFav ? t(FAV_NAME) : c.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                >
                  {t("{{count}} 條路線", { count: c.list.length })}
                  {!isFav && (
                    <>
                      {" · "}
                      {c.schedules.length > 0
                        ? t("按時段自動展開於首頁")
                        : t("未設定時段，不會自動展開")}
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </Box>
          <IconButton
            aria-label={t("新增路線至此收藏")}
            color="primary"
            onClick={() => {
              setOpen((o) => ({ ...o, [c.name]: true }));
              setAdding(index);
            }}
          >
            <AddIcon />
          </IconButton>
          {!isFav && (
            <IconButton
              aria-label={t("更多操作")}
              aria-haspopup="menu"
              onClick={(e) => setMenu({ el: e.currentTarget, index })}
            >
              <MoreIcon />
            </IconButton>
          )}
        </Box>
        {expanded && (
          <ItemList
            droppableId={`c-${index}`}
            type="route"
            isDropDisabled={
              !!dragging &&
              dragging.from !== `c-${index}` &&
              c.list.includes(dragging.item)
            }
            items={c.list}
            emptyText={t("此收藏未有路線，按「+」新增")}
            onMove={(from, to) =>
              commit(
                all.map((x, i) =>
                  i === index ? { ...x, list: moveWithin(x.list, from, to) } : x
                ),
                null
              )
            }
            onRemove={(item) =>
              commit(
                all.map((x, i) => (i === index ? removeItem(x, item) : x)),
                t("已移除路線")
              )
            }
            moveTargets={moveTargetsFor(index)}
            onMoveTo={(item, to) =>
              commit(
                moveBetween(all, item, index, to),
                t("已移動路線至 {{name}}", { name: displayName(to) })
              )
            }
          />
        )}
      </Paper>
    );
  };

  const stopsOpen = open["__stops"] ?? false;

  return (
    <Box
      sx={{
        p: 1.5,
        maxWidth: 720,
        mx: "auto",
        width: "100%",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography variant="h6" component="h1">
          {t("管理收藏")}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<AddIcon />}
          onClick={createCollection}
          sx={{ whiteSpace: "nowrap", flexShrink: 0, ml: 1 }}
        >
          {t("新增收藏")}
        </Button>
      </Box>

      {saveFailed && (
        <Alert
          severity="error"
          sx={{ mb: 1.5 }}
          onClose={() => setSaveFailed(false)}
        >
          {t(
            "儲存失敗：瀏覽器儲存空間可能已滿。你的更改在關閉頁面後可能會遺失。"
          )}
        </Alert>
      )}

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {all.map(renderGroup)}

        {collections.length === 0 && (
          <Paper variant="outlined" sx={{ p: 3, textAlign: "center", mb: 1.5 }}>
            <Typography gutterBottom>{t("未有自訂收藏")}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("建立收藏，把常搭的路線分組，例如「返工」、「回家」。")}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={createCollection}
            >
              {t("新增收藏")}
            </Button>
          </Paper>
        )}

        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              p: 0.5,
              pl: 1,
            }}
          >
            <IconButton
              aria-label={stopsOpen ? t("收合") : t("展開")}
              aria-expanded={stopsOpen}
              onClick={() => setOpen((o) => ({ ...o, __stops: !stopsOpen }))}
            >
              <ExpandIcon
                sx={{ transform: stopsOpen ? "rotate(180deg)" : undefined }}
              />
            </IconButton>
            <Box
              sx={{ flex: 1, cursor: "pointer" }}
              onClick={() => setOpen((o) => ({ ...o, __stops: !stopsOpen }))}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t("車站")}
              </Typography>
              <Chip
                size="small"
                label={t("{{count}} 個車站", { count: savedStops.length })}
              />
            </Box>
            <IconButton
              aria-label={t("收藏車站")}
              color="primary"
              onClick={() => {
                setOpen((o) => ({ ...o, __stops: true }));
                setAdding(STOPS);
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
          {stopsOpen && (
            <ItemList
              droppableId="stops"
              type="stop"
              items={savedStops}
              emptyText={t("未有收藏車站，按「+」搜尋車站")}
              onMove={(from, to) =>
                commit(all, null, moveWithin(savedStops, from, to))
              }
              onRemove={(item) =>
                commit(
                  all,
                  t("已移除車站"),
                  savedStops.filter((s) => s !== item)
                )
              }
            />
          )}
        </Paper>
      </DragDropContext>

      {/* disableRestoreFocus: otherwise closing the menu steals focus back from the rename field */}
      <Menu
        anchorEl={menu?.el}
        open={!!menu}
        onClose={() => setMenu(null)}
        disableRestoreFocus
        TransitionProps={{
          onExited: () => {
            if (pendingRename.current !== null) {
              setRenaming(pendingRename.current);
              pendingRename.current = null;
            }
          },
        }}
      >
        <MenuItem
          onClick={() => {
            // start renaming only after the menu has fully closed (see onExited below)
            pendingRename.current = menu!.index;
            setRenameError("");
            setMenu(null);
          }}
        >
          {t("重新命名")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            // existing dialog (mounted in Root) edits the day/time schedule; index excludes Starred
            toggleCollectionDialog(menu!.index - 1);
            setMenu(null);
          }}
        >
          {t("設定時段")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            commit(duplicateCollection(all, menu!.index), null);
            setMenu(null);
          }}
        >
          {t("複製")}
        </MenuItem>
        <MenuItem
          disabled={!menu || menu.index <= 1}
          onClick={() => {
            swapCollections(menu!.index, -1);
            setMenu(null);
          }}
        >
          {t("上移")}
        </MenuItem>
        <MenuItem
          disabled={!menu || menu.index >= all.length - 1}
          onClick={() => {
            swapCollections(menu!.index, 1);
            setMenu(null);
          }}
        >
          {t("下移")}
        </MenuItem>
        <MenuItem
          sx={{ color: "error.main" }}
          onClick={() => {
            setConfirmDelete(menu!.index);
            setMenu(null);
          }}
        >
          {t("刪除")}
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
      >
        <DialogTitle>{t("刪除收藏？")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDelete !== null &&
              t("「{{name}}」及其中 {{n}} 條路線將被刪除。", {
                name: all[confirmDelete]?.name,
                n: all[confirmDelete]?.list.length,
              })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>{t("取消")}</Button>
          <Button
            color="error"
            onClick={() => {
              if (confirmDelete !== null) {
                commit(
                  all.filter((_, i) => i !== confirmDelete),
                  t("已刪除收藏")
                );
              }
              setConfirmDelete(null);
            }}
          >
            {t("刪除")}
          </Button>
        </DialogActions>
      </Dialog>

      <AddSearchDialog
        open={adding !== null}
        onClose={() => setAdding(null)}
        stopsOnly={adding === STOPS}
        targetName={
          adding === STOPS ? t("車站") : target ? displayName(adding!) : ""
        }
        existingRoutes={target?.list ?? []}
        savedStops={savedStops}
        onAddRoute={(item) => {
          if (adding === null || adding === STOPS) return;
          commit(
            all.map((x, i) => (i === adding ? addItem(x, item) : x)),
            null
          );
        }}
        onAddRoutes={(items) => {
          if (adding === null || adding === STOPS) return;
          commit(
            all.map((x, i) => (i === adding ? items.reduce(addItem, x) : x)),
            null
          );
        }}
        onAddStop={(key) => {
          if (!savedStops.includes(key))
            commit(all, null, [...savedStops, key]);
        }}
      />

      <Snackbar
        open={!!undo}
        autoHideDuration={6000}
        onClose={(_, reason) => reason !== "clickaway" && setUndo(null)}
        message={undo?.message}
        action={
          <Button color="inherit" size="small" onClick={doUndo}>
            {t("復原")}
          </Button>
        }
      />
    </Box>
  );
};

export default CollectionEditorPage;
