import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  SxProps,
  Theme,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowBackIosNew as BackIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import OptionsList from "./OptionsList";
import SavedEtaList from "./SavedEtaList";

interface PersonalizeModalProps {
  open: boolean;
  handleClose: () => void;
}

const PersonalizeDialog = ({ open, handleClose }: PersonalizeModalProps) => {
  const [tab, setTab] = useState<"savedOrder" | "options">("options");
  const { t } = useTranslation();

  return (
    <Dialog
      PaperProps={{
        sx: DialogSx,
      }}
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={DialogTitleSx}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {tab === "savedOrder" && (
            <IconButton onClick={() => setTab("options")}>
              <BackIcon />
            </IconButton>
          )}
          {t(tab === "options" ? "個性化設定" : "常用報時排序")}
        </Box>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      {tab === "options" && (
        <OptionsList goToSavedRouteOrder={() => setTab("savedOrder")} />
      )}
      {tab === "savedOrder" && <SavedEtaList />}
    </Dialog>
  );
};

export default PersonalizeDialog;

const DialogSx: SxProps<Theme> = {
  height: "100%",
};

const DialogTitleSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
};
