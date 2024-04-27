import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Close as CloseIcon,
  NavigationOutlined as DirectionsIcon,
  PinDropOutlined as MapIcon,
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
import DbContext from "../../context/DbContext";
import CollectionContext from "../../CollectionContext";

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
  const language = useLanguage();

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
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
        "_blank"
      );
    }
  }, [stopList, stops]);

  const handleClickLocation = useCallback(() => {
    if (stopList[stops[0][1]]?.location) {
      const { lat, lng } = stopList[stops[0][1]].location;
      window.open(`https://www.google.com/maps/?q=${lat},${lng}`, "_blank");
    }
  }, [stopList, stops]);

  return (
    <Dialog open={open} onClose={onClose} sx={rootSx}>
      <DialogTitle sx={titleSx}>
        <Box>
          <IconButton onClick={() => updateSavedStops(stops[0].join("|"))}>
            {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          {stopList[stops[0][1]]?.name[language]}
          &nbsp;&nbsp;
          <IconButton onClick={handleClickDirection}>
            <DirectionsIcon />
          </IconButton>
          <IconButton onClick={handleClickLocation}>
            <MapIcon />
          </IconButton>
        </Box>
        <Box>
          <IconButton onClick={onClose}>
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
