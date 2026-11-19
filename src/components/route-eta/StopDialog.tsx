import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Close as CloseIcon,
  NavigationOutlined as DirectionsIcon,
  PinDropOutlined as MapIcon,
  ArrowOutward as ArrowOutwardIcon,
} from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  SxProps,
  Theme,
} from "@mui/material";
import { useCallback, useContext, useMemo } from "react";
import StopRouteList from "../bookmarked-stop/StopRouteList";
import { Company } from "hk-bus-eta";
import useLanguage from "../../hooks/useTranslation";
import { useTranslation } from "react-i18next";
import DbContext from "../../context/DbContext";
import CollectionContext from "../../CollectionContext";
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

interface StopDialogProps {
  open: boolean;
  stops: Array<[Company, string]>;
  onClose: () => void;
}

const StopDialog = ({ open, stops, onClose }: StopDialogProps) => {
  const {
    db: { stopList },
  } = useContext(DbContext);
  const { savedStops, updateSavedStops } = useContext(CollectionContext);
  const { openUrl } = useContext(AppContext);
  const language = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const bookmarked = useMemo<boolean>(
    () =>
      stops.reduce(
        (acc, cur) => acc || savedStops.includes(cur.join("|")),
        false
      ),
    [stops, savedStops]
  );

  const handleClickDirection = useCallback(() => {
    if (stopList[stops[0][1]]?.location) {
      const { lat, lng } = stopList[stops[0][1]].location;
      openUrl(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
      );
    }
  }, [stopList, stops, openUrl]);

  const handleClickLocation = useCallback(() => {
    if (stopList[stops[0][1]]?.location) {
      const { lat, lng } = stopList[stops[0][1]].location;
      openUrl(`https://www.google.com/maps/?q=${lat},${lng}`);
    }
  }, [openUrl, stopList, stops]);

  return (
    <Dialog open={open} onClose={onClose} sx={rootSx}>
      <DialogTitle sx={titleSx}>
        <Box>
          <IconButton
            aria-label={t("收藏")}
            aria-pressed={bookmarked}
            onClick={() => updateSavedStops(stops[0].join("|"))}
          >
            {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          {stopList[stops[0][1]]?.name[language]}
          &nbsp;&nbsp;
          <IconButton aria-label={t("導航")} onClick={handleClickDirection}>
            <DirectionsIcon />
          </IconButton>
          <IconButton
            aria-label={t("在地圖查看")}
            onClick={handleClickLocation}
          >
            <MapIcon />
          </IconButton>
          <IconButton
            aria-label={t("前往車站頁面")}
            onClick={() => navigate(`/${language}/stop/${stops[0][1]}`)}
          >
            <ArrowOutwardIcon />
          </IconButton>
        </Box>
        <Box>
          <IconButton aria-label={t("關閉視窗")} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <StopRouteList stops={stops} isFocus={true} />
      </DialogContent>
    </Dialog>
  );
};

export default StopDialog;

const rootSx: SxProps<Theme> = {
  "& .MuiPaper-root": {
    width: "100%",
    marginTop: "90px",
    height: "calc(100vh - 100px)",
  },
  "& .MuiDialogContent-root": {
    padding: 0,
  },
};

const titleSx: SxProps<Theme> = {
  backgroundColor: (theme) => theme.palette.background.default,
  color: (theme) => theme.palette.primary.main,
  display: "flex",
  justifyContent: "space-between",
};
