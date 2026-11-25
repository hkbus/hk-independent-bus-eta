import { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  InputAdornment,
  List,
  ListSubheader,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import {
  PinDropOutlined as PinDropIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DbContext from "../context/DbContext";
import AppContext from "../context/AppContext";
import useLanguage from "../hooks/useTranslation";
import RouteRow from "../components/route-board/RouteRow";
import { buildNameIndex } from "../search/nameSearch";
import { setSeoHeader } from "../utils";
import StopDialog from "../components/route-eta/StopDialog";
import type { StopTuple } from "hk-bus-eta";

const NameSearchPage = () => {
  const {
    AppTitle,
    db: { routeList, stopList, stopMap },
  } = useContext(DbContext);
  const { addSearchHistory } = useContext(AppContext);
  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  // Built lazily on first visit, rebuilt only when the db changes.
  const search = useMemo(
    () => buildNameIndex({ routeList, stopList }),
    [routeList, stopList]
  );
  const { routes, stops: rawStops } = useMemo(
    () => search(query),
    [search, query]
  );
  const [dialogStops, setDialogStops] = useState<StopTuple[] | null>(null);

  // Collapse stops that stopMap groups as the same nearby stop (one row each).
  const stops = useMemo(() => {
    const seen = new Set<string>();
    return rawStops.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      stopMap[id]?.forEach(([, s]) => seen.add(s));
      return true;
    });
  }, [rawStops, stopMap]);

  const openStop = (id: string) => {
    // ponytail: scan routes for the company on click; index id->co if slow.
    for (const { stops: byCo } of Object.values(routeList))
      for (const [co, ids] of Object.entries(byCo))
        if (ids.includes(id)) {
          setDialogStops([[co, id] as StopTuple, ...(stopMap[id] ?? [])]);
          return;
        }
  };

  useEffect(() => {
    setSeoHeader({
      title: `${t("名稱搜尋")} - ${t(AppTitle)}`,
      description: t("名稱搜尋"),
      lang: language,
    });
  }, [language, t, AppTitle]);

  return (
    <Box sx={{ height: "100%", overflowY: "auto" }}>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("輸入路線或車站名稱")}
          inputProps={{ "aria-label": t("輸入路線或車站名稱") }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {query.trim() && !routes.length && !stops.length && (
        <Typography sx={{ p: 2 }} color="text.secondary">
          {t("找不到結果")}
        </Typography>
      )}
      {routes.length > 0 && (
        <List
          disablePadding
          subheader={<ListSubheader>{t("路線列表")}</ListSubheader>}
        >
          {routes.map((id) => (
            <Box key={id} sx={{ height: 60 }}>
              <RouteRow
                route={[id, routeList[id]]}
                style={{ display: "block", height: "100%" }}
                onClick={(e) => {
                  e.preventDefault();
                  addSearchHistory(id);
                  navigate(`/${language}/route/${id.toLowerCase()}`);
                }}
              />
            </Box>
          ))}
        </List>
      )}
      {stops.length > 0 && (
        <List
          disablePadding
          subheader={<ListSubheader>{t("車站")}</ListSubheader>}
        >
          {stops.map((id) => (
            <Box key={id} sx={{ height: 60 }}>
              <Card variant="outlined" square sx={stopCardSx}>
                <CardActionArea
                  onClick={() => openStop(id)}
                  aria-label={stopList[id].name[language]}
                >
                  <CardContent sx={stopContentSx}>
                    <PinDropIcon color="action" />
                    <Typography noWrap>
                      {stopList[id].name[language]}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </List>
      )}
      {dialogStops && (
        <StopDialog
          open
          stops={dialogStops}
          onClose={() => setDialogStops(null)}
        />
      )}
    </Box>
  );
};

export default NameSearchPage;

// Mirrors RouteRow's card so both sections look alike.
const stopCardSx: SxProps<Theme> = {
  border: "none",
  display: "flex",
  alignItems: "center",
  height: "100%",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBlockColor: (t) => (t.palette.mode === "dark" ? grey[900] : grey[200]),
};

const stopContentSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "25% 65%",
  py: 0.5,
  px: 2,
  alignItems: "center",
  justifyItems: "start",
};
