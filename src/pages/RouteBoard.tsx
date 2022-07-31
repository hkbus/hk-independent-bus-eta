import React, { useContext, useState, useCallback, useEffect } from "react";
import AppContext from "../AppContext";
import { Box } from "@mui/material";
import RouteInputPad from "../components/route-board/RouteInputPad";
import { useTranslation } from "react-i18next";
import BoardTabbar, {
  BoardTabType,
  isBoardTab,
} from "../components/route-board/BoardTabbar";
import SwipeableRoutesBoard from "../components/route-board/SwipeableRoutesBoard";
import SeoHeader from "../SeoHeader";

interface RouteListProps {
  boardTab: BoardTabType;
  setBoardTab: (v: BoardTabType) => void;
}

const RouteList = ({ boardTab, setBoardTab }: RouteListProps) => {
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
  const { t } = useTranslation();
  const { AppTitle } = useContext(AppContext);
  const [boardTab, setBoardTab] = useState<BoardTabType>("all");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const _boardTab = localStorage.getItem("boardTab");
      if (isBoardTab(_boardTab) && _boardTab !== "all") {
        setBoardTab(_boardTab);
      }
    }
  }, []);

  return (
    <>
      <SeoHeader
        title={`${t("搜尋")} - ${t(AppTitle)}`}
        description={t("route-board-page-description")}
      />
      <RouteList boardTab={boardTab} setBoardTab={setBoardTab} />
      <RouteInputPad boardTab={boardTab} />
    </>
  );
};

export default RouteBoard;
