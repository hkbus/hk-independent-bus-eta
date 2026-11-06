import {
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ExpandMore as ExpandIcon,
  BookmarkBorder as BookmarkIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import DbContext from "../../context/DbContext";
import useLanguage from "../../hooks/useTranslation";
import RouteNo from "../route-board/RouteNo";
import {
  routesAtStop,
  searchAll,
  stopsOfRoute,
} from "../../utils/collectionSearch";

interface Props {
  open: boolean;
  onClose: () => void;
  targetName: string;
  /** saving a stop bookmark: routes are irrelevant, show stops only */
  stopsOnly?: boolean;
  /** items already in the target collection ("routeKey/seq") */
  existingRoutes: string[];
  /** saved stop keys ("co|stopId") */
  savedStops: string[];
  onAddRoute: (item: string) => void;
  onAddStop: (key: string) => void;
  /** add several route items at once (single state update) */
  onAddRoutes: (items: string[]) => void;
}

const AddSearchDialog = ({
  open,
  onClose,
  targetName,
  stopsOnly = false,
  existingRoutes,
  savedStops,
  onAddRoute,
  onAddStop,
  onAddRoutes,
}: Props) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  // start every session with an empty search
  useEffect(() => {
    if (open) {
      setQuery("");
      setExpanded(null);
      setFilter("all");
    }
  }, [open]);
  const deferred = useDeferredValue(query);
  const [filter, setFilter] = useState<"all" | "route" | "stop">("all");
  const mode = stopsOnly ? "stop" : filter;
  const found = useMemo(
    () => searchAll(routeList, stopList, deferred),
    [routeList, stopList, deferred]
  );
  // "all" shows a balanced preview so stops aren't buried under route matches
  const PREVIEW = 8;
  const routes =
    mode === "stop"
      ? []
      : mode === "all"
        ? found.routes.slice(0, PREVIEW)
        : found.routes;
  const stops =
    mode === "route"
      ? []
      : mode === "all"
        ? found.stops.slice(0, PREVIEW)
        : found.stops;
  const busy = deferred !== query;
  const has = new Set(existingRoutes);

  const addButton = (done: boolean, label: string, onClick: () => void) => (
    <IconButton
      edge="end"
      aria-label={label}
      onClick={onClick}
      disabled={done}
      color={done ? "success" : "primary"}
    >
      {done ? <CheckIcon /> : <AddIcon />}
    </IconButton>
  );

  const routeNo = (no: string) => (
    <Box sx={{ minWidth: "3.5em", mr: 1.5 }}>
      <RouteNo routeNo={language === "zh" ? t(no) : no} />
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        sx: { m: { xs: 1, sm: 4 }, width: "100%", maxHeight: "90dvh" },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap variant="h6" component="span">
            {t("新增至")} {targetName}
          </Typography>
        </Box>
        <IconButton aria-label={t("關閉")} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 1 }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("搜尋路線編號、目的地或車站")}
          inputProps={{ "aria-label": t("搜尋路線編號、目的地或車站") }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {!stopsOnly && (
          <Box
            sx={{ display: "flex", gap: 1, mt: 1, px: 0.5 }}
            role="group"
            aria-label={t("篩選")}
          >
            {(["all", "route", "stop"] as const).map((f) => (
              <Chip
                key={f}
                size="small"
                clickable
                color={filter === f ? "primary" : "default"}
                label={
                  f === "all"
                    ? t("全部")
                    : f === "route"
                      ? t("路線")
                      : t("車站")
                }
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              />
            ))}
          </Box>
        )}
        {!query.trim() && (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            {t("輸入路線編號、目的地或車站名稱開始搜尋")}
          </Typography>
        )}
        {query.trim() && !busy && !routes.length && !stops.length && (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            {t("找不到結果")}
          </Typography>
        )}
        {routes.length > 0 && (
          <List
            dense
            subheader={
              <Typography variant="overline" sx={{ px: 2 }}>
                {t("路線")}
              </Typography>
            }
          >
            {routes.map(({ key, route }) => {
              const first = `${key}/0`;
              const isOpen = expanded === `r:${key}`;
              return (
                <Box key={key}>
                  <ListItem
                    disablePadding
                    secondaryAction={addButton(has.has(first), t("加入"), () =>
                      onAddRoute(first)
                    )}
                  >
                    <ListItemButton
                      onClick={() => setExpanded(isOpen ? null : `r:${key}`)}
                      aria-expanded={isOpen}
                      sx={{ pr: 7 }}
                    >
                      {routeNo(route.route)}
                      <ListItemText
                        primary={`${route.orig[language]} → ${route.dest[language]}`}
                        secondary={route.co.map((c) => t(c)).join("+")}
                        primaryTypographyProps={{ noWrap: true }}
                      />
                      <ExpandIcon
                        fontSize="small"
                        sx={{
                          transform: isOpen ? "rotate(180deg)" : undefined,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={isOpen} unmountOnExit>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ pl: 9 }}
                    >
                      {t("選擇車站")}
                    </Typography>
                    <List
                      dense
                      disablePadding
                      sx={{ pl: 6, maxHeight: 240, overflowY: "auto" }}
                    >
                      {stopsOfRoute(route).map((sid, seq) => {
                        const item = `${key}/${seq}`;
                        return (
                          <ListItem
                            key={sid + seq}
                            disablePadding
                            secondaryAction={addButton(
                              has.has(item),
                              t("加入"),
                              () => onAddRoute(item)
                            )}
                          >
                            <ListItemButton
                              onClick={() => onAddRoute(item)}
                              disabled={has.has(item)}
                              sx={{ pr: 7 }}
                            >
                              <ListItemText
                                primary={`${seq + 1}. ${stopList[sid]?.name[language] ?? sid}`}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        )}
        {stops.length > 0 && (
          <List
            dense
            subheader={
              <Typography variant="overline" sx={{ px: 2 }}>
                {t("車站")}
              </Typography>
            }
          >
            {stops.map(({ id, co, name }) => {
              const isOpen = expanded === `s:${id}`;
              const stopKey = `${co}|${id}`;
              const saved = savedStops.includes(stopKey);
              const atStop = isOpen ? routesAtStop(routeList, id) : []; // only scan the DB for the open row
              return (
                <Box key={id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => setExpanded(isOpen ? null : `s:${id}`)}
                      aria-expanded={isOpen}
                    >
                      <ListItemText
                        primary={name[language]}
                        secondary={t(co)}
                        primaryTypographyProps={{ noWrap: true }}
                      />
                      <Chip size="small" label={t("車站")} sx={{ mr: 1 }} />
                      <ExpandIcon
                        fontSize="small"
                        sx={{
                          transform: isOpen ? "rotate(180deg)" : undefined,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={isOpen} unmountOnExit>
                    <Box sx={{ pl: 2, pb: 1 }}>
                      {/* A collection holds routes-at-a-stop, so "add this stop" adds the routes serving it
                          (they then show on the Home page); the bookmark only feeds the Stops page. */}
                      {!stopsOnly && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          startIcon={<AddIcon />}
                          disabled={atStop.every(({ key, seq }) =>
                            has.has(`${key}/${seq}`)
                          )}
                          onClick={() =>
                            onAddRoutes(
                              atStop.map(({ key, seq }) => `${key}/${seq}`)
                            )
                          }
                          sx={{ mr: 1, mb: 0.5 }}
                        >
                          {t("加入此站全部路線 ({{count}})", {
                            count: atStop.length,
                          })}
                        </Button>
                      )}
                      <Button
                        size="small"
                        startIcon={<BookmarkIcon />}
                        disabled={saved}
                        onClick={() => onAddStop(stopKey)}
                        sx={{ mb: 0.5 }}
                      >
                        {saved
                          ? t("已收藏車站")
                          : stopsOnly
                            ? t("收藏此車站")
                            : t("同時收藏至「車站」頁")}
                      </Button>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {t("經過此站的路線")}
                      </Typography>
                      <List
                        dense
                        disablePadding
                        sx={{ maxHeight: 240, overflowY: "auto" }}
                      >
                        {atStop.slice(0, 50).map(({ key, seq, route }) => {
                          const item = `${key}/${seq}`;
                          return (
                            <ListItem
                              key={key}
                              disablePadding
                              secondaryAction={addButton(
                                has.has(item),
                                t("加入"),
                                () => onAddRoute(item)
                              )}
                            >
                              <ListItemButton
                                onClick={() => onAddRoute(item)}
                                disabled={has.has(item)}
                                sx={{ pr: 7 }}
                              >
                                {routeNo(route.route)}
                                <ListItemText
                                  primary={`${t("往")} ${route.dest[language]}`}
                                  primaryTypographyProps={{ noWrap: true }}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddSearchDialog;
