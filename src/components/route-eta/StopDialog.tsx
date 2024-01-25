import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  SxProps,
  Theme,
} from "@mui/material";
import { useContext, useMemo } from "react";
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

  return (
    <Dialog open={open} onClose={onClose} sx={rootSx}>
      <DialogTitle sx={titleSx}>
        <IconButton onClick={() => updateSavedStops(stops[0].join("|"))}>
          {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
        {stopList[stops[0][1]]?.name[i18n.language]}
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
};
