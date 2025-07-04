import {
  Box,
  Container,
  ContainerProps,
  IconButton,
  Paper,
  SxProps,
  Theme,
} from "@mui/material";
import { RefObject, useContext, useRef } from "react";
import Draggable from "react-draggable";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import {
  Minimize as MinimizeIcon,
  Close as CloseIcon,
  PushPin as PushPinIcon,
} from "@mui/icons-material";
import PinnedEtasContext from "../../context/PinnedEtasContext";

const PinDialogContainer = (props: ContainerProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable
      nodeRef={nodeRef as RefObject<HTMLDivElement>}
      handle="#draggable-pin-dialog-title"
      cancel='[id*="pin-dialog-irrelavant"]'
      positionOffset={{ x: 0, y: 150 }}
    >
      <Container {...props} ref={nodeRef} />
    </Draggable>
  );
};

export default function PinDialog() {
  const {
    pinnedEtas,
    isHidden,
    togglePinnedEta,
    tooglePinnedEtasDialog,
    closePinnedEtas,
  } = useContext(PinnedEtasContext);

  if (pinnedEtas.length === 0) {
    return null;
  }

  return (
    <PinDialogContainer maxWidth="xs" sx={containerSx}>
      <Box
        id="draggable-pin-dialog-title"
        sx={{
          px: 1,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: (t) => t.palette.background.default,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PushPinIcon sx={{ transform: "rotate(-45deg)" }} />
          <IconButton
            onClick={tooglePinnedEtasDialog}
            id="pin-dialog-irrelavant-min-icon"
          >
            <MinimizeIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={closePinnedEtas}
            id="pin-dialog-irrelavant-close-icon"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      <Paper id="pin-dialog-irrelavant-paper" sx={{ overflow: "scroll" }}>
        {!isHidden &&
          pinnedEtas.map((eta) => (
            <Box sx={entrySx} key={`pinned-${eta}`}>
              <SuccinctTimeReport routeId={eta} />
              <Box>
                <IconButton onClick={() => togglePinnedEta(eta)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
      </Paper>
    </PinDialogContainer>
  );
}

const entrySx: SxProps<Theme> = {
  boxShadow: "2px 2px 2px 1px rgba(0, 0, 0, 0.1)",
  display: "flex",
  alignItems: "center",
};

const containerSx: SxProps<Theme> = {
  position: "absolute",
  maxHeight: "30vh",
  overflow: "scroll",
  display: "flex",
  flexDirection: "column",
  borderColor: (t) => t.palette.primary.main,
  borderWidth: 1,
  borderStyle: "solid",
  paddingLeft: "0 !important",
  paddingRight: "0 !important",
  zIndex: (t) => t.zIndex.modal,
};
