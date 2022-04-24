import React, { useContext, useEffect, useState, useRef } from "react";
import AppContext from "../AppContext";
import { Box } from "@mui/material";
import RouteInputPad from "../components/route-board/RouteInputPad";
import { useTranslation } from "react-i18next";
import { setSeoHeader } from "../utils";
import BoardTabbar, {
  BoardTabType,
  isBoardTab,
} from "../components/route-board/BoardTabbar";
import SwipeableRoutesBoard from "../components/route-board/SwipeableDashBoard";

interface RouteListProps {
  boardTab: BoardTabType;
  setBoardTab: (v: BoardTabType) => void;
}

const RouteList = ({ boardTab, setBoardTab }: RouteListProps) => {
  const { AppTitle } = useContext(AppContext);

  const { t, i18n } = useTranslation();
  const swipeableList = useRef(null);

  useEffect(() => {
    setSeoHeader({
      title: t("搜尋") + " - " + t(AppTitle),
      description: t("route-board-page-description"),
      lang: i18n.language,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const handleTabChange = (v, rerenderList = false) => {
    setBoardTab(v);
    localStorage.setItem("boardTab", v);
    if (swipeableList.current && rerenderList) {
      swipeableList.current.changeTab(v);
    }
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <BoardTabbar boardTab={boardTab} onChangeTab={handleTabChange} />
      <SwipeableRoutesBoard
        ref={swipeableList}
        boardTab="all"
        onChangeTab={handleTabChange}
      />
    </Box>
  );
};

const RouteBoard = () => {
  const _boardTab = localStorage.getItem("boardTab");
  const [boardTab, setBoardTab] = useState<BoardTabType>(
    isBoardTab(_boardTab) ? _boardTab : "all"
  );

  return (
    <>
      <RouteList boardTab={boardTab} setBoardTab={setBoardTab} />
      <RouteInputPad boardTab={boardTab} />
    </>
  );
};

export default RouteBoard;
