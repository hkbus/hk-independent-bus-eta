import { useContext, useMemo, useState } from "react";
import AppContext from "../AppContext";
import { Paper, SxProps, Theme } from "@mui/material";
import BadWeatherCard from "../components/layout/BadWeatherCard";
import DbRenewReminder from "../components/layout/DbRenewReminder";
import StopTabbar from "../components/bookmarked-stop/StopTabbar";
import StopRouteList from "../components/bookmarked-stop/StopRouteList";

const BookmarkedStop = () => {
  const {
    savedStops,
    db: { stopList, stopMap },
  } = useContext(AppContext);
  const defaultTab = useMemo(() => {
    for (let i = 0; i < savedStops.length; ++i) {
      let stopId = savedStops[i].split("|")[1];
      if (stopList[stopId]) return savedStops[i];
    }
    return "";
  }, [savedStops, stopList]);

  const [stopTab, setStopTab] = useState<string>(defaultTab);

  const stops = useMemo(() => {
    if (stopTab === "") return undefined;
    const ret = [stopTab.split("|")];
    stopMap[ret[0][1]]?.forEach((v) => ret.push(v));
    return ret;
  }, [stopTab, stopMap]);

  return (
    <Paper sx={paperSx} square elevation={0}>
      <StopTabbar
        stopTab={stopTab}
        onChangeTab={(v: string) => setStopTab(v)}
      />
      <BadWeatherCard />
      <DbRenewReminder />
      <StopRouteList stops={stops} />
    </Paper>
  );
};

export default BookmarkedStop;

const paperSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === "dark" ? theme.palette.background.default : "white",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  width: "100%",
};
