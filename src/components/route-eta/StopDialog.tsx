import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import AppContext from "../../AppContext";
import StopRouteList from "../bookmarked-stop/StopRouteList";
import { dialogRootSx, dialogTitleSx } from "../ui/dialog";

const StopDialog = ({ open, stops, handleClose }) => {
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
    <Dialog open={open} onClose={handleClose} sx={dialogRootSx}>
      <DialogTitle sx={dialogTitleSx}>
        <IconButton onClick={() => updateSavedStops(stops[0].join("|"))}>
          {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
        {stopList[stops[0][1]].name[i18n.language]}
      </DialogTitle>
      <DialogContent>
        <StopRouteList stops={stops} />
      </DialogContent>
    </Dialog>
  );
};

export default StopDialog;
