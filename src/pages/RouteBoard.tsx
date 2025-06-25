import { useContext, useEffect, useState, useCallback } from "react";
import AppContext from "../context/AppContext";
import { Box } from "@mui/material";
import RouteInputPad from "../components/route-board/RouteInputPad";
import { useTranslation } from "react-i18next";
import { setSeoHeader } from "../utils";
import BoardTabbar, { isBoardTab } from "../components/route-board/BoardTabbar";
import SwipeableRoutesBoard from "../components/route-board/SwipeableRoutesBoard";
import { BoardTabType } from "../@types/types";
import useLanguage from "../hooks/useTranslation";
import DbContext from "../context/DbContext";

interface RouteListProps {
  boardTab: BoardTabType;
  setBoardTab: (v: BoardTabType) => void;
}

const RouteList = ({ boardTab, setBoardTab }: RouteListProps) => {
  const { AppTitle } = useContext(DbContext);

  const { t } = useTranslation();
  const language = useLanguage();

  useEffect(() => {
    setSeoHeader({
      title: t("搜尋") + " - " + t(AppTitle),
      description: t("route-board-page-description"),
      lang: language,
    });
  }, [language, t, AppTitle]);

  const handleTabChange = useCallback(
    (v: BoardTabType) => {
      setBoardTab(v);
      localStorage.setItem("boardTab", v);
    },
    [setBoardTab]
  );

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <BoardTabbar boardTab={boardTab} onChangeTab={handleTabChange} />
      <SwipeableRoutesBoard boardTab={boardTab} onChangeTab={handleTabChange} />
    </Box>
  );
};

const RouteBoard = () => {
  const { isRecentSearchShown } = useContext(AppContext);
  const _boardTab = localStorage.getItem("boardTab");
  const [boardTab, setBoardTab] = useState<BoardTabType>(
    isBoardTab(_boardTab, isRecentSearchShown) ? _boardTab : "all"
  );

  return (
    /** column-reverse ease the usage of screen reader (e.g., visual impairment) */
    <Box display="flex" flexDirection="column-reverse" flex={1}>
      <RouteInputPad boardTab={boardTab} />
      <RouteList boardTab={boardTab} setBoardTab={setBoardTab} />
    </Box>
  );
};

export default RouteBoard;
