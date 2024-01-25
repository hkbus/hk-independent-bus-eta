import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AppContext from "../AppContext";
import { Box, Paper, SxProps, Theme } from "@mui/material";
import BadWeatherCard from "../components/layout/BadWeatherCard";
import DbRenewReminder from "../components/layout/DbRenewReminder";
import StopTabbar from "../components/bookmarked-stop/StopTabbar";
import { useTranslation } from "react-i18next";
import SwipeableStopList, {
  SwipeableStopListRef,
} from "../components/bookmarked-stop/SwipeableStopList";

const BookmarkedStop = () => {
  const {
    savedStops,
    db: { stopList },
    colorMode,
  } = useContext(AppContext);
  const {
    i18n: { language },
  } = useTranslation();
  const swipeableList = useRef<SwipeableStopListRef>(null);
  const defaultTab = useMemo(() => {
    try {
      const cached = localStorage.getItem("stopTab") ?? "|";
      if (
        cached &&
        savedStops.includes(cached) &&
        stopList[cached.split("|")[1]]
      ) {
        return cached;
      }
      for (let i = 0; i < savedStops.length; ++i) {
        let stopId = savedStops[i].split("|")[1];
        if (stopList[stopId]) {
          return savedStops[i];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "";
  }, [savedStops, stopList]);
  const [stopTab, setStopTab] = useState<string>(defaultTab);

  const bgColor = useCallback(
    (theme: Theme) => {
      if (stopTab === "") return "unset";
      return theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white";
    },
    [stopTab]
  );

  useEffect(() => {
    localStorage.setItem("stopTab", stopTab);
  }, [stopTab]);

  const handleTabChange = useCallback((v: string) => {
    setStopTab(v);
    swipeableList.current?.changeTab(v);
  }, []);

  return (
    <Paper
      sx={{
        ...paperSx,
        bgcolor: bgColor,
        backgroundImage:
          stopTab === ""
            ? `url(/img/stop-bookmark-guide-${colorMode}-${language}.png)`
            : "unset",
        opacity: stopTab === "" ? "0.8" : "unset",
      }}
      square
      elevation={0}
    >
      <StopTabbar stopTab={stopTab} onChangeTab={handleTabChange} />
      <BadWeatherCard />
      <DbRenewReminder />
      <Box sx={{ flex: 1, overflow: "scroll" }}>
        <SwipeableStopList
          ref={swipeableList}
          stopTab={stopTab}
          onChangeTab={handleTabChange}
        />
      </Box>
    </Paper>
  );
};

export default BookmarkedStop;

const paperSx: SxProps<Theme> = {
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  width: "100%",
  flex: 1,
  backgroundSize: "contain",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};
