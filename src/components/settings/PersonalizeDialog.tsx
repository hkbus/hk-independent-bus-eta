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
import CollectionOrderList from "./CollectionOrderList";
import StopOrderList from "./StopOrderList";

interface PersonalizeModalProps {
  open: boolean;
  onClose: () => void;
}

type TAB = "savedOrder" | "options" | "collectionOrder" | "stopOrder";

const PersonalizeDialog = ({ open, onClose }: PersonalizeModalProps) => {
  const [tab, setTab] = useState<TAB>("options");
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
    setTab("options");
  };

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {["savedOrder", "collectionOrder"].includes(tab) && (
            <IconButton onClick={() => setTab("options")}>
              <BackIcon />
            </IconButton>
          )}
          {t(tab === "savedOrder" ? "常用報時排序" : "")}
          {t(tab === "options" ? "個性化設定" : "")}
          {t(tab === "collectionOrder" ? "收藏排序" : "")}
          {t(tab === "stopOrder" ? "車站排序" : "")}
        </Box>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      {tab === "options" && <OptionsList goToTab={(tab: TAB) => setTab(tab)} />}
      {tab === "savedOrder" && <SavedEtaList />}
      {tab === "collectionOrder" && <CollectionOrderList />}
      {tab === "stopOrder" && <StopOrderList />}
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
