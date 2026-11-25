import { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DbContext from "../context/DbContext";
import AppContext from "../context/AppContext";
import useLanguage from "../hooks/useTranslation";
import RouteRow from "../components/route-board/RouteRow";
import { buildNameIndex } from "../search/nameSearch";
import { setSeoHeader } from "../utils";

const NameSearchPage = () => {
  const {
    AppTitle,
    db: { routeList, stopList },
  } = useContext(DbContext);
  const { addSearchHistory } = useContext(AppContext);
  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Built lazily on first visit, rebuilt only when the db changes.
  const search = useMemo(
    () => buildNameIndex({ routeList, stopList }),
    [routeList, stopList]
  );
  const { routes, stops } = useMemo(() => search(query), [search, query]);

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
        <List disablePadding subheader={<ListSubheader>{t("路線")}</ListSubheader>}>
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
        <List disablePadding subheader={<ListSubheader>{t("車站")}</ListSubheader>}>
          {stops.map((id) => (
            <ListItemButton
              key={id}
              onClick={() => navigate(`/${language}/stop/${id}`)}
            >
              <ListItemText
                primary={stopList[id].name[language]}
                secondary={stopList[id].name[language === "zh" ? "en" : "zh"]}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
};

export default NameSearchPage;
