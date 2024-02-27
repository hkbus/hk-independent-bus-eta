import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Close as CloseIcon,
  Directions as DirectionsIcon,
  MapOutlined as MapIcon,
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
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import StopRouteList from "../bookmarked-stop/StopRouteList";
import { Company } from "hk-bus-eta";

interface StopDialogProps {
  open: boolean;
  stops: Array<[Company, string]>;
  onClose: () => void;
}

const StopDialog = ({ open, stops, onClose }: StopDialogProps) => {
  const {
    db: { stopList },
    savedStops,
    updateSavedStops,
  } = useContext(AppContext);
  const { i18n } = useTranslation();

  const bookmarked = useMemo<boolean>(
    () =>
      stops.reduce(
        (acc, cur) => acc || savedStops.includes(cur.join("|")),
        false
      ),
    [stops, savedStops]
  );

  const handleClickDirection = useCallback(() => {
    try {
      const { lat, lng } = stopList[stops[0][1]]?.location;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
        "_blank"
      );
    } catch (err) {
      console.error(err);
    }
  }, [stopList, stops]);

  const handleClickLocation = useCallback(() => {
    try {
      const { lat, lng } = stopList[stops[0][1]]?.location;
      window.open(`https://www.google.com/maps/?q=${lat},${lng}`, "_blank");
    } catch (err) {
      console.error(err);
    }
  }, [stopList, stops]);

  return (
    <Dialog open={open} onClose={onClose} sx={rootSx}>
      <DialogTitle sx={titleSx}>
        <Box>
          <IconButton onClick={() => updateSavedStops(stops[0].join("|"))}>
            {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          {stopList[stops[0][1]]?.name[i18n.language]}
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
