import { memo, useContext } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import DbContext from "../../context/DbContext";
import useLanguage from "../../hooks/useTranslation";
import RouteNo from "../route-board/RouteNo";
import { stopsOfRoute } from "../../utils/collectionSearch";

/** Compact label for a "routeKey/seq" collection item, or a "co|stopId" saved stop. */
const ItemLabel = ({ item }: { item: string }) => {
  const { t } = useTranslation();
  const language = useLanguage();
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);

  if (item.includes("|")) {
    const [co, stopId] = item.split("|");
    return (
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap variant="body1">
          {stopList[stopId]?.name[language] ?? stopId}
        </Typography>
        <Typography noWrap variant="caption" color="text.secondary">
          {t("車站")} · {t(co)}
        </Typography>
      </Box>
    );
  }
  const [routeKey, seq] = item.split("/");
  const route = routeList[routeKey];
  if (!route) {
    return (
      <Typography noWrap variant="body2" color="text.secondary">
        {item}
      </Typography>
    );
  }
  const stopId = stopsOfRoute(route)[parseInt(seq, 10)];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <Box sx={{ minWidth: "3.5em" }}>
        <RouteNo routeNo={language === "zh" ? t(route.route) : route.route} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap variant="body2">
          {t("往")} {route.dest[language]}
        </Typography>
        <Typography noWrap variant="caption" color="text.secondary">
          {stopList[stopId]?.name[language] ?? ""} ·{" "}
          {route.co.map((c) => t(c)).join("+")}
        </Typography>
      </Box>
    </Box>
  );
};

// memo: a 300-item collection re-renders every row on each edit otherwise
export default memo(ItemLabel);
