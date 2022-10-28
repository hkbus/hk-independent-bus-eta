import React, {
  useContext,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import AppContext from "../AppContext";
import { Box } from "@mui/material";
import RouteInputPad from "../components/route-board/RouteInputPad";
import { useTranslation } from "react-i18next";
import { setSeoHeader } from "../utils";
import BoardTabbar, {
  BoardTabType,
  isBoardTab,
} from "../components/route-board/BoardTabbar";
import SwipeableRoutesBoard from "../components/route-board/SwipeableRoutesBoard";
import RouteSearchHistory from "../components/route-board/RouteSearchHistory";

interface RouteListProps {
  boardTab: BoardTabType;
  setBoardTab: (v: BoardTabType) => void;
}

const RouteList = ({ boardTab, setBoardTab }: RouteListProps) => {
  const { AppTitle } = useContext(AppContext);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    setSeoHeader({
      title: t("搜尋") + " - " + t(AppTitle),
      description: t("route-board-page-description"),
      lang: i18n.language,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const handleTabChange = useCallback(
    (v) => {
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
  const { searchRoute, routeSearchHistory } = useContext(AppContext);
  const _boardTab = localStorage.getItem("boardTab");
  const [boardTab, setBoardTab] = useState<BoardTabType>(
    isBoardTab(_boardTab) ? _boardTab : "all"
  );

  const isShowSearchHistory = useMemo(() => {
    return (
      searchRoute.length === 0 &&
      Array.isArray(routeSearchHistory) &&
      routeSearchHistory.length > 0
    );
  }, [searchRoute, routeSearchHistory]);

  return (
    <>
      {isShowSearchHistory ? (
        <RouteSearchHistory />
      ) : (
        <RouteList boardTab={boardTab} setBoardTab={setBoardTab} />
      )}
      <RouteInputPad boardTab={isShowSearchHistory ? "all" : boardTab} />
    </>
  );
};

export default RouteBoard;
